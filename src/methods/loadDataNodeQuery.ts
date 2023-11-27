import getExtension from "../helpers/getExtension.js"

export default function loadDataNodeQuery(
    table: string,
    files: string[],
    options: {
        fileType?: "csv" | "dsv" | "json" | "parquet"
        autoDetect?: boolean
        fileName?: boolean
        unifyColumns?: boolean
        columnTypes?: { [key: string]: string }
        // csv options
        header?: boolean
        allText?: boolean
        delim?: string
        skip?: number
        // json options
        jsonFormat?: "unstructured" | "newlineDelimited" | "array"
        records?: boolean
    } = {}
) {
    const fileExtension = getExtension(files[0])
    const filesAsString = JSON.stringify(files)

    // General options, except for parquet
    const autoDetect =
        typeof options.autoDetect === "boolean"
            ? `, auto_detect=${String(options.autoDetect).toUpperCase()}`
            : ", auto_detect=TRUE"
    const columnTypes = options.columnTypes
        ? `, columns=${JSON.stringify(options.columnTypes)}`
        : ""
    const fileName =
        typeof options.fileName === "boolean"
            ? `, filename='${String(options.fileName).toUpperCase()}'`
            : ""
    const unifyColumns =
        typeof options.unifyColumns === "boolean"
            ? `, union_by_name='${String(options.unifyColumns).toUpperCase()}'`
            : ""
    const generalOptions = `${autoDetect}${columnTypes}${fileName}${unifyColumns}`

    if (
        options.fileType === "csv" ||
        fileExtension === "csv" ||
        options.fileType === "dsv" ||
        typeof options.delim === "string"
    ) {
        if (!options.autoDetect) {
            const header =
                typeof options.header === "boolean"
                    ? `, header=${String(options.header).toUpperCase()}`
                    : ", header=TRUE"
            const allText =
                typeof options.allText === "boolean"
                    ? `, all_varchar=${String(options.allText).toUpperCase()}`
                    : ""
            const delim = options.delim ? `, delim='${options.delim}'` : ""
            const skip = options.skip ? `, skip=${options.skip}` : ""

            return `CREATE OR REPLACE TABLE ${table}
            AS SELECT * FROM read_csv_auto(${filesAsString}${generalOptions}${header}${allText}${delim}${skip})`
        } else {
            return `CREATE OR REPLACE TABLE ${table}
            AS SELECT * FROM read_csv_auto(${filesAsString}${generalOptions}, header=TRUE)`
        }
    } else if (options.fileType === "json" || fileExtension === "json") {
        if (!options.autoDetect) {
            const jsonFormat = options.jsonFormat
                ? `, format='${options.jsonFormat}'`
                : ""
            const records =
                typeof options.records === "boolean"
                    ? `, records=${String(options.records).toUpperCase()}`
                    : ""
            return `CREATE OR REPLACE TABLE ${table}
            AS SELECT * FROM read_json_auto(${filesAsString}${generalOptions}${jsonFormat}${records})`
        } else {
            return `CREATE OR REPLACE TABLE ${table}
            AS SELECT * FROM read_json_auto(${filesAsString}${generalOptions})`
        }
    } else if (options.fileType === "parquet" || fileExtension === "parquet") {
        return `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM read_parquet(${filesAsString}${fileName}${unifyColumns})`
    } else {
        throw new Error(
            `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`
        )
    }
}
