export default function parseValue(value: unknown) {
  if (Number.isNaN(value) || value === undefined || value === null) {
    return "NULL";
  } else if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  } else if (typeof value === "string") {
    return `'${value}'`;
  } else if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(`Unkown type ${typeof value} of ${value}`);
  }
}
