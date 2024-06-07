import getExtension from "../helpers/getExtension.js"

export default function loadDataNodeQuery(
    table: string,
    files: string[],
    options: {
        fileType?: "csv" | "dsv" | "json" | "parquet" | "excel"
        autoDetect?: boolean
        limit?: number
        fileName?: boolean
        unifyColumns?: boolean
        columnTypes?: { [key: string]: string }
        // csv options
        header?: boolean
        allText?: boolean
        delim?: string
        skip?: number
        compression?: "none" | "gzip" | "zstd"
        // json options
        jsonFormat?: "unstructured" | "newlineDelimited" | "array"
        records?: boolean
        // excel options
        sheet?: string
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

    const limit =
        typeof options.limit === "number" ? ` LIMIT ${options.limit}` : ""

    if (
        options.fileType === "csv" ||
        fileExtension === "csv" ||
        options.fileType === "dsv" ||
        typeof options.delim === "string"
    ) {
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
        const compression = options.compression
            ? `, compression=${options.compression}`
            : ""

        return `CREATE OR REPLACE TABLE ${table}
            AS SELECT * FROM read_csv_auto(${filesAsString}${generalOptions}${header}${allText}${delim}${skip}${compression})${limit};`
    } else if (options.fileType === "json" || fileExtension === "json") {
        const jsonFormat = options.jsonFormat
            ? `, format='${options.jsonFormat}'`
            : ""
        const records =
            typeof options.records === "boolean"
                ? `, records=${String(options.records).toUpperCase()}`
                : ""
        return `CREATE OR REPLACE TABLE ${table}
            AS SELECT * FROM read_json_auto(${filesAsString}${generalOptions}${jsonFormat}${records})${limit};`
    } else if (options.fileType === "parquet" || fileExtension === "parquet") {
        return `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM read_parquet(${filesAsString}${fileName}${unifyColumns})${limit};`
    } else if (options.fileType === "excel" || fileExtension === "xlsx") {
        if (files.length > 1) {
            throw new Error(
                "For excel files or files with extension .xlsx, you can pass only one file at the time."
            )
        }

        return `INSTALL spatial; LOAD spatial; INSTALL https; LOAD https;
        CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ST_Read('${
            files[0]
        }'${options.sheet ? `, layer='${options.sheet}'` : ""})${limit};`
    } else {
        throw new Error(
            `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`
        )
    }
}
