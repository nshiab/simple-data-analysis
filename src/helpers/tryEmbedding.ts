import { getEmbedding } from "@nshiab/journalism";

export default async function tryEmbedding(
  i: number,
  rows: {
    [key: string]: string | number | boolean | Date | null;
  }[],
  text: string,
  newColumn: string,
  options: {
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean;
    verbose?: boolean;
  } = {},
) {
  // Should be improved...
  return rows[i][newColumn] = await getEmbedding(
    text,
    options,
  ) as unknown as number;
}
