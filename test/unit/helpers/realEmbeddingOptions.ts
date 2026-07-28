const project = Deno.env.get("AI_PROJECT");
const location = Deno.env.get("AI_LOCATION");
const usesVertex = Boolean(project && location);

export const hasGoogleEmbeddingCredentials = Boolean(
  Deno.env.get("AI_KEY") || usesVertex,
);

export const geminiEmbeddingOptions = usesVertex
  ? {
    provider: "gemini",
    vertex: true,
    model: "gemini-embedding-001",
  } as const
  : {
    provider: "gemini",
    model: "gemini-embedding-001",
  } as const;
