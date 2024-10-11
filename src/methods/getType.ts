export default function getType(value: unknown) {
  if (value instanceof Date) {
    return "TIMESTAMP";
  } else if (typeof value === "bigint" || Number.isInteger(value)) {
    return "BIGINT";
  } else if (typeof value === "number") {
    return "DOUBLE";
  } else if (typeof value === "string") {
    return "VARCHAR";
  } else if (typeof value === "boolean") {
    return "BOOLEAN";
  } else {
    throw new Error(
      `Unkown type ${typeof value} for ${value}. Using first item in array to set the column types.`,
    );
  }
}
