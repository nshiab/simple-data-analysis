import { test, expect, vi } from "vite-plus/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { assertThrows } from "../../helpers/assertions.ts";
import {
  default as askAI,
  normalizeOllamaStructuredText,
  parseOllamaStructuredResponse,
} from "../../../src/helpers/askAI.ts";
import { type ChatRequest, type ChatResponse, Ollama } from "ollama";
import { array, object, string, toJSONSchema } from "zod";

test("parses Ollama structured output with a JSON label", () => {
  expect(parseOllamaStructuredResponse('json\n{"query":"SELECT 1"}')).toEqual({
    query: "SELECT 1",
  });
});

test("parses fenced Ollama structured output", () => {
  expect(parseOllamaStructuredResponse('```json\n{"query":"SELECT 1"}\n```')).toEqual({
    query: "SELECT 1",
  });
});

test("preserves already parsed Ollama structured output", () => {
  const response = { query: "SELECT 1" };
  expect(parseOllamaStructuredResponse(response)).toEqual(response);
});

test("normalizes an unmatched duplicate opening brace", () => {
  expect(normalizeOllamaStructuredText('{{"query":"SELECT 1"}')).toEqual('{"query":"SELECT 1"}');
});

test("normalizes an unmatched opening brace on its own line", () => {
  expect(normalizeOllamaStructuredText('json\n{\n{"query":"SELECT 1"}')).toEqual(
    '{"query":"SELECT 1"}',
  );
});

test("normalizes an array wrapped in an opening bracket and JSON fence", () => {
  expect(normalizeOllamaStructuredText('[```json\n[{"value":"one"}]')).toEqual('[{"value":"one"}]');
});

test("normalizes nested Ollama JSON labels and fences", () => {
  expect(normalizeOllamaStructuredText('json\n[```json\n[{"value":"one"}]\n```')).toEqual(
    '[{"value":"one"}]',
  );
});

test("normalizes a fenced array after an opening bracket and newline", () => {
  expect(normalizeOllamaStructuredText('json\n[\n```json\n[{"value":"one"}]\n```')).toEqual(
    '[{"value":"one"}]',
  );
});

test("extracts a valid object after a malformed Ollama label", () => {
  expect(parseOllamaStructuredResponse('"query{\n  "query": "SELECT 1"\n}')).toEqual({
    query: "SELECT 1",
  });
});

test("rejects invalid Ollama structured output", () => {
  assertThrows(
    () => parseOllamaStructuredResponse("not JSON"),
    Error,
    "Failed to parse Ollama response as JSON",
  );
});

test("normalizes structured output before journalism-ai parses it", async () => {
  const client = new Ollama();
  client.chat = (() =>
    Promise.resolve({
      message: {
        role: "assistant",
        content: '[```json\n[{"value":"one"}]',
      },
    } as ChatResponse)) as unknown as Ollama["chat"];

  const result = await askAI<{ value: string }[]>("Return one value.", {
    generation: {
      provider: "ollama",
      model: "test-model",
      ollama: client,
    },
    schemaJson: toJSONSchema(array(object({ value: string() }))),
    processResponse: (response) => response as { value: string }[],
  });

  expect(result).toEqual([{ value: "one" }]);
});

test("uses environment provider selection with nested generation options", async () => {
  const previousProvider = process.env["AI_PROVIDER"];
  const client = new Ollama();
  client.chat = (() =>
    Promise.resolve({
      message: {
        role: "assistant",
        content: '{"value":"environment"}',
      },
    } as ChatResponse)) as unknown as Ollama["chat"];

  process.env["AI_PROVIDER"] = "ollama";
  try {
    const result = await askAI<{ value: string }>("Return one value.", {
      generation: {
        model: "environment-model",
        ollama: client,
      },
      schemaJson: toJSONSchema(object({ value: string() })),
    });

    expect(result).toEqual({ value: "environment" });
  } finally {
    if (previousProvider === undefined) {
      delete process.env["AI_PROVIDER"];
    } else {
      process.env["AI_PROVIDER"] = previousProvider;
    }
  }
});

test("reprocesses a cached raw response with the current callback", async () => {
  const previousDirectory = process.cwd();
  const temporaryDirectory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  process.chdir(temporaryDirectory);
  try {
    let calls = 0;
    let beforeRequests = 0;
    const client = new Ollama();
    client.chat = (() => {
      calls++;
      return Promise.resolve({
        message: {
          role: "assistant",
          content: '{"value":"one"}',
        },
      } as ChatResponse);
    }) as unknown as Ollama["chat"];
    const schemaJson = toJSONSchema(object({ value: string() }));

    const first = await askAI<{ value: string }>("Return one value.", {
      generation: {
        provider: "ollama",
        model: "cache-test-model",
        ollama: client,
        cache: true,
      },
      schemaJson,
      processResponse: (response) => ({
        value: `${(response as { value: string }).value}-first`,
      }),
      beforeRequest: () => {
        beforeRequests++;
        return Promise.resolve();
      },
    });
    const second = await askAI<{ value: string }>("Return one value.", {
      generation: {
        provider: "ollama",
        model: "cache-test-model",
        ollama: client,
        cache: true,
      },
      schemaJson,
      processResponse: (response) => ({
        value: `${(response as { value: string }).value}-second`,
      }),
      beforeRequest: () => {
        beforeRequests++;
        return Promise.resolve();
      },
    });

    expect(first).toEqual({ value: "one-first" });
    expect(second).toEqual({ value: "one-second" });
    expect(calls).toEqual(1);
    expect(beforeRequests).toEqual(1);
  } finally {
    process.chdir(previousDirectory);
    await rm(temporaryDirectory, { recursive: true });
  }
});

test("keys processed responses by the environment-selected model", async () => {
  const previousDirectory = process.cwd();
  const previousModel = process.env["AI_MODEL"];
  const temporaryDirectory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  process.chdir(temporaryDirectory);
  try {
    let calls = 0;
    const client = new Ollama();
    client.chat = ((request: ChatRequest & { stream?: false }) => {
      calls++;
      return Promise.resolve({
        message: {
          role: "assistant",
          content: JSON.stringify({ value: request.model }),
        },
      } as ChatResponse);
    }) as unknown as Ollama["chat"];
    const schemaJson = toJSONSchema(object({ value: string() }));

    process.env["AI_MODEL"] = "first-model";
    const first = await askAI<{ value: string }>("Return the model.", {
      generation: {
        provider: "ollama",
        ollama: client,
        cache: true,
      },
      schemaJson,
      processResponse: (response) => response as { value: string },
    });
    process.env["AI_MODEL"] = "second-model";
    const second = await askAI<{ value: string }>("Return the model.", {
      generation: {
        provider: "ollama",
        ollama: client,
        cache: true,
      },
      schemaJson,
      processResponse: (response) => response as { value: string },
    });

    expect(first).toEqual({ value: "first-model" });
    expect(second).toEqual({ value: "second-model" });
    expect(calls).toEqual(2);
  } finally {
    process.chdir(previousDirectory);
    if (previousModel === undefined) {
      delete process.env["AI_MODEL"];
    } else {
      process.env["AI_MODEL"] = previousModel;
    }
    await rm(temporaryDirectory, { recursive: true });
  }
});

function structuredResponse(content: string): ChatResponse {
  return {
    model: "adapter-test-model",
    created_at: new Date(0),
    message: { role: "assistant", content },
    done: true,
    done_reason: "stop",
    total_duration: 1,
    load_duration: 0,
    prompt_eval_count: 5,
    prompt_eval_duration: 1,
    eval_count: 3,
    eval_duration: 1,
  };
}

for (const deferred of [false, true]) {
  test(`sends the original schema once with deferred validation ${deferred}`, async () => {
    const client = new Ollama();
    const chat = vi
      .spyOn(client, "chat")
      .mockResolvedValue(structuredResponse('json\n{"value":"one"}'));
    const schema = object({ value: string() });
    const schemaJson = toJSONSchema(schema);
    const prompt = "Return one value.";
    const result = await askAI(prompt, {
      generation: {
        provider: "ollama",
        model: "adapter-test-model",
        ollama: client,
        cache: false,
      },
      schemaJson,
      processResponse: deferred ? (response) => schema.parse(response) : undefined,
    });

    expect(result).toEqual({ value: "one" });
    expect(chat).toHaveBeenCalledTimes(1);
    const request = chat.mock.calls[0][0];
    expect(request.format).toEqual(schemaJson);
    expect(request.messages).toEqual([
      {
        role: "user",
        content: `${prompt}\n\nReturn JSON matching this schema exactly:\n${JSON.stringify(schemaJson)}`,
      },
    ]);
  });
}

test("processes parsed provider output before SDA processing and preserves the raw cache boundary", async () => {
  const previousDirectory = process.cwd();
  const temporaryDirectory = mkdtempSync(tmpdir() + "/sda-adapter-cache-");
  process.chdir(temporaryDirectory);
  try {
    const client = new Ollama();
    const chat = vi
      .spyOn(client, "chat")
      .mockResolvedValue(structuredResponse('```json\n{"raw":"one"}\n```'));
    const schema = object({ value: string() });
    const events: string[] = [];
    const generation = {
      provider: "ollama" as const,
      model: "adapter-test-model",
      ollama: client,
      cache: true,
      processResponse: (response: unknown) => {
        events.push("provider");
        const raw = object({ raw: string() }).parse(response);
        return Promise.resolve({ wrapped: { value: raw.raw } });
      },
    };
    const schemaJson = toJSONSchema(schema);
    const first = await askAI("Return one value.", {
      generation,
      schemaJson,
      processResponse: (response) => {
        events.push("first processor");
        return object({ wrapped: schema }).parse(response).wrapped;
      },
    });
    const second = await askAI("Return one value.", {
      generation,
      schemaJson,
      processResponse: (response) => {
        events.push("second processor");
        const parsed = object({ wrapped: schema }).parse(response).wrapped;
        return { value: `${parsed.value}-updated` };
      },
    });

    expect(first).toEqual({ value: "one" });
    expect(second).toEqual({ value: "one-updated" });
    expect(events).toEqual(["provider", "first processor", "provider", "second processor"]);
    expect(chat).toHaveBeenCalledTimes(1);
    expect(chat.mock.calls[0][0].format).toEqual(schemaJson);
  } finally {
    process.chdir(previousDirectory);
    await rm(temporaryDirectory, { recursive: true });
  }
});
