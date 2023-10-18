import getExtension from "../helpers/getExtension.js"

export default function writeDataQuery(
    table: string,
    file: string,
    options: { compression?: boolean }
) {
    const fileExtension = getExtension(file)
    if (fileExtension === "csv") {
        if (options.compression) {
            return `COPY ${table} TO '${
                file + ".gz"
            }' (DELIMITER ',', HEADER TRUE, COMPRESSION GZIP);`
        } else {
            return `COPY ${table} TO '${file}' (DELIMITER ',', HEADER TRUE);`
        }
    } else if (fileExtension === "json") {
        if (options.compression) {
            return `COPY ${table} TO '${
                file + ".gz"
            }' (FORMAT JSON, ARRAY TRUE, COMPRESSION GZIP);`
        } else {
            return `COPY ${table} TO '${file}' (FORMAT JSON, ARRAY TRUE);`
        }
    } else if (fileExtension === "parquet") {
        if (options.compression) {
            return `COPY ${table} to '${file}' (FORMAT PARQUET, COMPRESSION ZSTD);`
        } else {
            return `COPY ${table} to '${file}' (FORMAT PARQUET);`
        }
    } else {
        throw new Error(`Unknown extension ${fileExtension}`)
    }
}
