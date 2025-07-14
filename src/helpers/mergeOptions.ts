import type Simple from "../class/Simple.ts";

export default function mergeOptions(
  simple: Simple,
  options: {
    table: string | null;
    method: string | null;
    parameters: { [key: string]: unknown } | null;
    nbRowsToLog?: number;
    returnDataFrom?: "query" | "none";
    debug?: boolean;
    types?: { [key: string]: string };
  },
): {
  table: string | null;
  method: string | null;
  parameters: { [key: string]: unknown } | null;
  nbRowsToLog: number;
  nbCharactersToLog: number | undefined;
  returnDataFrom: "query" | "none";
  debug: boolean;
  types?: { [key: string]: string };
} {
  return {
    table: options.table,
    method: options.method,
    parameters: options.parameters,
    nbRowsToLog: options.nbRowsToLog ?? simple.nbRowsToLog,
    nbCharactersToLog: simple.nbCharactersToLog,
    returnDataFrom: options.returnDataFrom ?? "none",
    debug: options.debug ?? simple.debug,
    types: options.types,
  };
}
