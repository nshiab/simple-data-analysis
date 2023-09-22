import getExtension from "../../helpers/getExtension.js"

export default function loadDataQuery(
    tableName: string,
    files: string[],
    options: {
        fileType?: "csv" | "dsv" | "json" | "parquet"
        autoDetect?: boolean
        fileName?: boolean
        unifyColumns?: boolean
        columns?: { [key: string]: string }
        // csv options
        header?: boolean
        delim?: string
        skip?: number
        // json options
        format?: "unstructured" | "newlineDelimited" | "array"
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
    const columns = options.columns
        ? `, columns=${JSON.stringify(options.columns)}`
        : ""
    const fileName =
        typeof options.fileName === "boolean"
            ? `, filename='${String(options.fileName).toUpperCase()}'`
            : ""
    const unifyColumns =
        typeof options.unifyColumns === "boolean"
            ? `, union_by_name='${String(options.unifyColumns).toUpperCase()}'`
            : ""
    const generalOptions = `${autoDetect}${columns}${fileName}${unifyColumns}`

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
            const delim = options.delim ? `, delim='${options.delim}'` : ""
            const skip = options.skip ? `, skip=${options.skip}` : ""

            return `CREATE TABLE ${tableName}
            AS SELECT * FROM read_csv_auto(${filesAsString}${generalOptions}${header}${delim}${skip})`
        } else {
            return `CREATE TABLE ${tableName}
            AS SELECT * FROM read_csv_auto(${filesAsString}${generalOptions}, header=TRUE)`
        }
    } else if (options.fileType === "json" || fileExtension === "json") {
        if (!options.autoDetect) {
            const format = options.format ? `, format='${options.format}'` : ""
            const records =
                typeof options.records === "boolean"
                    ? `, records=${String(options.records).toUpperCase()}`
                    : ""
            return `CREATE TABLE ${tableName}
            AS SELECT * FROM read_json_auto(${filesAsString}${generalOptions}${format}${records})`
        } else {
            return `CREATE TABLE ${tableName}
            AS SELECT * FROM read_json_auto(${filesAsString}${generalOptions})`
        }
    } else if (options.fileType === "parquet" || fileExtension === "parquet") {
        return `CREATE TABLE ${tableName} AS SELECT * FROM read_parquet(${filesAsString}${fileName}${unifyColumns})`
    } else {
        throw new Error(
            `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`
        )
    }
}
