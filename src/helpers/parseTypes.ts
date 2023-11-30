export default function parseType(
    type:
        | "integer"
        | "float"
        | "string"
        | "date"
        | "time"
        | "datetime"
        | "datetimeTz"
        | "bigint"
        | "double"
        | "varchar"
        | "timestamp"
        | "timestamp with time zone"
) {
    if (type === "integer") {
        return "BIGINT"
    } else if (type === "float") {
        return "DOUBLE"
    } else if (type === "string") {
        return "VARCHAR"
    } else if (type === "datetime") {
        return "TIMESTAMP"
    } else if (type === "datetimeTz") {
        return "TIMESTAMP WITH TIME ZONE"
    } else if (type === "time") {
        return "TIME"
    } else if (
        [
            "date",
            "time",
            "bigint",
            "double",
            "varchar",
            "timestamp",
            "timestamp with time zone",
        ].includes(type)
    ) {
        return type.toUpperCase()
    } else {
        throw new Error(`Unknown type ${type}`)
    }
}
