export default function parseType(
  type:
    | "integer"
    | "float"
    | "number"
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
    | "boolean"
    | "geometry",
) {
  const typeLowerCase = type.toLowerCase();
  if (typeLowerCase === "integer") {
    return "INTEGER";
  } else if (typeLowerCase === "float" || typeLowerCase === "number") {
    return "DOUBLE";
  } else if (typeLowerCase === "string") {
    return "VARCHAR";
  } else if (typeLowerCase === "datetime") {
    return "TIMESTAMP";
  } else if (typeLowerCase === "datetimetz") {
    return "TIMESTAMP WITH TIME ZONE";
  } else if (
    [
      "date",
      "time",
      "bigint",
      "double",
      "varchar",
      "timestamp",
      "timestamp with time zone",
      "boolean",
      "geometry",
    ].includes(type)
  ) {
    return type.toUpperCase();
  } else {
    throw new Error(`Unknown type ${type}`);
  }
}
