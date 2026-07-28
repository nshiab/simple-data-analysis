import type { OllamaEmbeddingClient } from "../../../src/index.ts";

export class FakeOllamaEmbeddingClient implements OllamaEmbeddingClient {
  readonly embeddingEndpoint: string;
  requests = 0;
  #vector: number[];

  constructor(embeddingEndpoint: string, vector: number[]) {
    this.embeddingEndpoint = embeddingEndpoint;
    this.#vector = vector;
  }

  embed(): Promise<{ embeddings: number[][] }> {
    this.requests++;
    return Promise.resolve({ embeddings: [this.#vector] });
  }
}

export class FakeGeminiEmbeddingFetch {
  requests = 0;
  #vector: number[];

  constructor(vector: number[]) {
    this.#vector = vector;
  }

  fetch = (
    _input: string | URL | Request,
    _init?: RequestInit,
  ): Promise<Response> => {
    this.requests++;
    return Promise.resolve(
      new Response(
        JSON.stringify({ embeddings: [{ values: this.#vector }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
  };
}
