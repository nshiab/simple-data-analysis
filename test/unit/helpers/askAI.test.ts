import { assertEquals, assertThrows } from "@std/assert";
import {
  default as askAI,
  normalizeOllamaStructuredText,
  parseOllamaStructuredResponse,
} from "../../../src/helpers/askAI.ts";
import { type ChatRequest, type ChatResponse, Ollama } from "ollama";
import { array, object, string, toJSONSchema } from "zod";

Deno.test("parses Ollama structured output with a JSON label", () => {
  assertEquals(
    parseOllamaStructuredResponse('json\n{"query":"SELECT 1"}'),
    { query: "SELECT 1" },
  );
});

Deno.test("parses fenced Ollama structured output", () => {
  assertEquals(
    parseOllamaStructuredResponse('```json\n{"query":"SELECT 1"}\n```'),
    { query: "SELECT 1" },
  );
});

Deno.test("preserves already parsed Ollama structured output", () => {
  const response = { query: "SELECT 1" };
  assertEquals(parseOllamaStructuredResponse(response), response);
});

Deno.test("normalizes an unmatched duplicate opening brace", () => {
  assertEquals(
    normalizeOllamaStructuredText('{{"query":"SELECT 1"}'),
    '{"query":"SELECT 1"}',
  );
});

Deno.test("normalizes an unmatched opening brace on its own line", () => {
  assertEquals(
    normalizeOllamaStructuredText(
      'json\n{\n{"query":"SELECT 1"}',
    ),
    '{"query":"SELECT 1"}',
  );
});

Deno.test("normalizes an array wrapped in an opening bracket and JSON fence", () => {
  assertEquals(
    normalizeOllamaStructuredText('[```json\n[{"value":"one"}]'),
    '[{"value":"one"}]',
  );
});

Deno.test("normalizes nested Ollama JSON labels and fences", () => {
  assertEquals(
    normalizeOllamaStructuredText(
      'json\n[```json\n[{"value":"one"}]\n```',
    ),
    '[{"value":"one"}]',
  );
});

Deno.test("normalizes a fenced array after an opening bracket and newline", () => {
  assertEquals(
    normalizeOllamaStructuredText(
      'json\n[\n```json\n[{"value":"one"}]\n```',
    ),
    '[{"value":"one"}]',
  );
});

Deno.test("rejects invalid Ollama structured output", () => {
  assertThrows(
    () => parseOllamaStructuredResponse("not JSON"),
    Error,
    "Failed to parse Ollama response as JSON",
  );
});

Deno.test("normalizes structured output before journalism-ai v2 parses it", async () => {
  const client = new Ollama();
  client.chat = (() =>
    Promise.resolve({
      message: {
        role: "assistant",
        content: '[```json\n[{"value":"one"}]',
      },
    } as ChatResponse)) as unknown as Ollama["chat"];

  const result = await askAI<{ value: string }[]>("Return one value.", {
    provider: "ollama",
    model: "test-model",
    ollama: client,
    schemaJson: toJSONSchema(array(object({ value: string() }))),
    processResponse: (response) => response as { value: string }[],
  });

  assertEquals(result, [{ value: "one" }]);
});

Deno.test("reprocesses a cached raw response with the current callback", async () => {
  const previousDirectory = Deno.cwd();
  const temporaryDirectory = await Deno.makeTempDir();
  Deno.chdir(temporaryDirectory);
  try {
    let calls = 0;
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
      provider: "ollama",
      model: "cache-test-model",
      ollama: client,
      schemaJson,
      cache: true,
      processResponse: (response) => ({
        value: `${(response as { value: string }).value}-first`,
      }),
    });
    const second = await askAI<{ value: string }>("Return one value.", {
      provider: "ollama",
      model: "cache-test-model",
      ollama: client,
      schemaJson,
      cache: true,
      processResponse: (response) => ({
        value: `${(response as { value: string }).value}-second`,
      }),
    });

    assertEquals(first, { value: "one-first" });
    assertEquals(second, { value: "one-second" });
    assertEquals(calls, 1);
  } finally {
    Deno.chdir(previousDirectory);
    await Deno.remove(temporaryDirectory, { recursive: true });
  }
});

Deno.test("keys processed responses by the environment-selected model", async () => {
  const previousDirectory = Deno.cwd();
  const previousModel = Deno.env.get("AI_MODEL");
  const temporaryDirectory = await Deno.makeTempDir();
  Deno.chdir(temporaryDirectory);
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

    Deno.env.set("AI_MODEL", "first-model");
    const first = await askAI<{ value: string }>("Return the model.", {
      provider: "ollama",
      ollama: client,
      schemaJson,
      cache: true,
      processResponse: (response) => response as { value: string },
    });
    Deno.env.set("AI_MODEL", "second-model");
    const second = await askAI<{ value: string }>("Return the model.", {
      provider: "ollama",
      ollama: client,
      schemaJson,
      cache: true,
      processResponse: (response) => response as { value: string },
    });

    assertEquals(first, { value: "first-model" });
    assertEquals(second, { value: "second-model" });
    assertEquals(calls, 2);
  } finally {
    Deno.chdir(previousDirectory);
    if (previousModel === undefined) {
      Deno.env.delete("AI_MODEL");
    } else {
      Deno.env.set("AI_MODEL", previousModel);
    }
    await Deno.remove(temporaryDirectory, { recursive: true });
  }
});
