import Simple from "../class/Simple"

export default function mergeOptions(
    simple: Simple,
    options: {
        table: string | null
        method: string | null
        parameters: { [key: string]: unknown } | null
        nbRowsToLog?: number
        returnDataFrom?: "query" | "none"
        debug?: boolean
    }
): {
    table: string | null
    method: string | null
    parameters: { [key: string]: unknown } | null
    nbRowsToLog: number
    nbCharactersToLog: number | undefined
    returnDataFrom: "query" | "none"
    debug: boolean
    bigIntToInt: boolean
} {
    return {
        table: options.table,
        method: options.method,
        parameters: options.parameters,
        nbRowsToLog: options.nbRowsToLog ?? simple.nbRowsToLog,
        nbCharactersToLog: simple.nbCharactersToLog,
        returnDataFrom: options.returnDataFrom ?? "none",
        debug: options.debug ?? simple.debug,
        bigIntToInt: simple.bigIntToInt ?? false,
    }
}
