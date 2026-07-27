type AIRow = { [key: string]: unknown };

/** Cleans and validates a batched AI response before it is cached or stored. */
export default function processAIRowsResponse(
  rawResponse: unknown,
  batchLength: number,
  newColumns: string[],
  options: {
    clean?: (response: unknown) => unknown;
    test?: (result: AIRow) => void;
  },
): AIRow[] {
  const response = options.clean ? options.clean(rawResponse) : rawResponse;
  if (!Array.isArray(response)) {
    throw new Error(
      `The AI returned a non-array value: ${JSON.stringify(response)}`,
    );
  }
  if (response.length !== batchLength) {
    throw new Error(
      `The AI returned ${response.length} values, but the batch size is ${batchLength}.`,
    );
  }
  for (const item of response) {
    if (typeof item !== "object" || item === null) {
      throw new Error(
        `The AI did not return an object: ${JSON.stringify(item)}`,
      );
    }
    for (const column of newColumns) {
      if (!(column in item)) {
        throw new Error(
          `The AI's response is missing the key '${column}': ${
            JSON.stringify(item)
          }`,
        );
      }
    }
    options.test?.(item as AIRow);
  }
  return response as AIRow[];
}
