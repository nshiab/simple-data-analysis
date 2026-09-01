import { array, object, string, toJSONSchema } from "zod";
import type { GenerationOptions } from "./aiOptions.ts";

type AIRow = { [key: string]: unknown };

type AIRowsRequestOptions = {
  generation?: GenerationOptions;
  extraInstructions?: string;
};

/** Builds the shared structured request used by SDA's row-processing methods. */
export default function buildAIRowsRequest(
  batch: AIRow[],
  column: string,
  newColumns: string[],
  prompt: string,
  options: AIRowsRequestOptions,
) {
  const schemaJson = options.generation?.schemaJson ??
    toJSONSchema(array(object(
      Object.fromEntries(newColumns.map((name) => [name, string()])),
    )));
  const requiredSystemPrompt =
    `You will be provided with a JSON array of ${batch.length} string items. You must return a JSON array containing exactly ${batch.length} objects, in the same corresponding order.`;
  const systemPrompt = options.generation?.systemPrompt
    ? `${options.generation.systemPrompt}\n\n${requiredSystemPrompt}`
    : requiredSystemPrompt;
  const requestPrompt =
    `${prompt}\n\nHere are the ${column} values as a JSON array:\n${
      JSON.stringify(batch.map((row) => row[column]), null, 2)
    }\n\n${options.extraInstructions ? `\n${options.extraInstructions}` : ""}`;

  return { prompt: requestPrompt, schemaJson, systemPrompt };
}
