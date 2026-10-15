import { test, expect, describe, beforeEach, afterEach } from "vite-plus/test";
import { assertRejects } from "../../helpers/assertions.ts";
import publishDatawrapper from "../../../src/helpers/publishDatawrapper.ts";

describe("Datawrapper exports", () => {
  const keyName = "SDA_DATAWRAPPER_TEST_KEY";
  const options = { apiKeyEnvVar: keyName };
  let originalFetch: typeof fetch;
  let originalKey: string | undefined;
  let calls: { url: string; init?: RequestInit }[];
  let failedMethod: string;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalKey = process.env[keyName];
    calls = [];
    failedMethod = "";
    process.env[keyName] = "test-key";
    globalThis.fetch = (input, init) => {
      calls.push({ url: input instanceof Request ? input.url : String(input), init });
      expect(new Headers(init?.headers).get("Authorization")).toEqual("Bearer test-key");
      const status = init?.method === failedMethod ? 500 : init?.method === "PUT" ? 204 : 200;
      return Promise.resolve(new Response(null, { status }));
    };
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env[keyName];
    else process.env[keyName] = originalKey;
  });
  test("sends only data when no information is supplied", async () => {
    await publishDatawrapper("abcde", "value\n1", options);
    expect(calls.map(({ init }) => init?.method)).toEqual(["PUT"]);
    expect(calls[0].url).toEqual("https://api.datawrapper.de/v3/charts/abcde/data");
    expect(calls[0].init?.body).toEqual("value\n1");
  });

  test("combines fields in one PATCH before optional publishing", async () => {
    calls.length = 0;
    await publishDatawrapper("abcde", "value\n1", {
      ...options,
      title: "Title",
      description: "Description",
      note: "Note",
      republish: true,
    });
    expect(calls.map(({ init }) => init?.method)).toEqual(["PUT", "PATCH", "POST"]);
    expect(calls[1].url).toEqual("https://api.datawrapper.de/v3/charts/abcde");
    expect(JSON.parse(calls[1].init?.body as string)).toEqual({
      title: "Title",
      metadata: {
        describe: { intro: "Description" },
        annotate: { notes: "Note" },
      },
    });
    expect(calls[2].url).toEqual("https://api.datawrapper.de/v3/charts/abcde/publish");
  });

  test("accepts each field alone, including empty strings", async () => {
    for (const field of ["title", "description", "note"] as const) {
      for (const value of ["Updated", ""]) {
        calls.length = 0;
        await publishDatawrapper("abcde", "data", {
          ...options,
          [field]: value,
        });
        expect(calls.map(({ init }) => init?.method)).toEqual(["PUT", "PATCH"]);
        const expected =
          field === "title"
            ? { title: value }
            : {
                metadata:
                  field === "description"
                    ? { describe: { intro: value } }
                    : { annotate: { notes: value } },
              };
        expect(JSON.parse(calls[1].init?.body as string)).toEqual(expected);
      }
    }
  });

  test("can republish without changing information", async () => {
    calls.length = 0;
    await publishDatawrapper("abcde", "data", {
      ...options,
      title: undefined,
      republish: true,
    });
    expect(calls.map(({ init }) => init?.method)).toEqual(["PUT", "POST"]);
  });

  test("stops after data or information failures", async () => {
    for (const method of ["PUT", "PATCH"]) {
      calls.length = 0;
      failedMethod = method;
      await assertRejects(
        () =>
          publishDatawrapper("abcde", "data", {
            ...options,
            title: "Title",
            republish: true,
          }),
        Error,
        "Upstream HTTP 500",
      );
      expect(calls.map(({ init }) => init?.method)).toEqual(
        method === "PUT" ? ["PUT"] : ["PUT", "PATCH"],
      );
    }
  });
});
