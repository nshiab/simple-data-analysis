type AIRow = { [key: string]: unknown };

function isRow(value: unknown): value is AIRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Processes each response row in order and validates the resulting objects. */
export default async function processAIRowsResponse(
  rawResponse: unknown,
  batchLength: number,
  newColumns: string[],
  options: {
    processResponse?: (response: AIRow) => unknown;
  },
): Promise<AIRow[]> {
  if (!Array.isArray(rawResponse)) {
    throw new Error(`The AI returned a non-array value: ${JSON.stringify(rawResponse)}`);
  }
  if (rawResponse.length !== batchLength) {
    throw new Error(
      `The AI returned ${rawResponse.length} values, but the batch size is ${batchLength}.`,
    );
  }
  const rows: AIRow[] = [];
  for (const item of rawResponse) {
    if (!isRow(item)) {
      throw new Error(`The AI did not return an object: ${JSON.stringify(item)}`);
    }
    const row = options.processResponse ? await options.processResponse(item) : item;
    if (!isRow(row)) {
      throw new Error(`processResponse must return an object: ${JSON.stringify(row)}`);
    }
    for (const column of newColumns) {
      if (!(column in row)) {
        throw new Error(`The AI's response is missing the key '${column}': ${JSON.stringify(row)}`);
      }
    }
    rows.push(row);
  }
  return rows;
}
