const project = process.env["AI_PROJECT"];
const location = process.env["AI_LOCATION"];
const usesVertex = Boolean(project && location);

export const hasGoogleEmbeddingCredentials = Boolean(process.env["AI_KEY"] || usesVertex);

export const geminiEmbeddingOptions = usesVertex
  ? ({
      provider: "gemini",
      vertex: true,
      model: "gemini-embedding-001",
      cache: false,
    } as const)
  : ({
      provider: "gemini",
      model: "gemini-embedding-001",
      cache: false,
    } as const);
