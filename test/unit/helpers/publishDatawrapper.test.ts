import { assertEquals, assertRejects } from "@std/assert";
import publishDatawrapper from "../../../src/helpers/publishDatawrapper.ts";

Deno.test("Datawrapper exports update supplied information before publishing", async (t) => {
  const originalFetch = globalThis.fetch;
  const keyName = "SDA_DATAWRAPPER_TEST_KEY";
  const originalKey = Deno.env.get(keyName);
  const calls: { url: string; init?: RequestInit }[] = [];
  let failedMethod = "";
  globalThis.fetch = (input, init) => {
    calls.push({ url: String(input), init });
    assertEquals(
      new Headers(init?.headers).get("Authorization"),
      "Bearer test-key",
    );
    const status = init?.method === failedMethod
      ? 500
      : init?.method === "PUT"
      ? 204
      : 200;
    return Promise.resolve(new Response(null, { status }));
  };
  const options = { apiKeyEnvVar: keyName };
  try {
    Deno.env.set(keyName, "test-key");
    await t.step(
      "sends only data when no information is supplied",
      async () => {
        await publishDatawrapper("abcde", "value\n1", options);
        assertEquals(calls.map(({ init }) => init?.method), ["PUT"]);
        assertEquals(
          calls[0].url,
          "https://api.datawrapper.de/v3/charts/abcde/data",
        );
        assertEquals(calls[0].init?.body, "value\n1");
      },
    );
    await t.step(
      "combines fields in one PATCH before optional publishing",
      async () => {
        calls.length = 0;
        await publishDatawrapper("abcde", "value\n1", {
          ...options,
          title: "Title",
          description: "Description",
          note: "Note",
          republish: true,
        });
        assertEquals(calls.map(({ init }) => init?.method), [
          "PUT",
          "PATCH",
          "POST",
        ]);
        assertEquals(
          calls[1].url,
          "https://api.datawrapper.de/v3/charts/abcde",
        );
        assertEquals(JSON.parse(String(calls[1].init?.body)), {
          title: "Title",
          metadata: {
            describe: { intro: "Description" },
            annotate: { notes: "Note" },
          },
        });
        assertEquals(
          calls[2].url,
          "https://api.datawrapper.de/v3/charts/abcde/publish",
        );
      },
    );
    await t.step(
      "accepts each field alone, including empty strings",
      async () => {
        for (const field of ["title", "description", "note"] as const) {
          for (const value of ["Updated", ""]) {
            calls.length = 0;
            await publishDatawrapper("abcde", "data", {
              ...options,
              [field]: value,
            });
            assertEquals(calls.map(({ init }) => init?.method), [
              "PUT",
              "PATCH",
            ]);
            const expected = field === "title" ? { title: value } : {
              metadata: field === "description"
                ? { describe: { intro: value } }
                : { annotate: { notes: value } },
            };
            assertEquals(JSON.parse(String(calls[1].init?.body)), expected);
          }
        }
      },
    );
    await t.step("can republish without changing information", async () => {
      calls.length = 0;
      await publishDatawrapper("abcde", "data", {
        ...options,
        title: undefined,
        republish: true,
      });
      assertEquals(calls.map(({ init }) => init?.method), ["PUT", "POST"]);
    });
    await t.step("stops after data or information failures", async () => {
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
        assertEquals(
          calls.map(({ init }) => init?.method),
          method === "PUT" ? ["PUT"] : ["PUT", "PATCH"],
        );
      }
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) Deno.env.delete(keyName);
    else Deno.env.set(keyName, originalKey);
  }
});
