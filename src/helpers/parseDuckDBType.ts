import {
  BIGINT,
  BOOLEAN,
  DATE,
  DOUBLE,
  INTEGER,
  TIME,
  TIMESTAMP,
  TIMESTAMPTZ,
  VARCHAR,
} from "@duckdb/node-api";

export default function parseDuckDBType(type: string) {
  if (type === "INTEGER") {
    return INTEGER;
  } else if (type === "BIGINT") {
    return BIGINT;
  } else if (type === "DOUBLE") {
    return DOUBLE;
  } else if (type === "VARCHAR") {
    return VARCHAR;
  } else if (type === "TIMESTAMP") {
    return TIMESTAMP;
  } else if (type === "TIMESTAMP WITH TIME ZONE") {
    return TIMESTAMPTZ;
  } else if (type === "DATE") {
    return DATE;
  } else if (type === "TIME") {
    return TIME;
  } else if (type === "BOOLEAN") {
    return BOOLEAN;
  } else {
    throw new Error(`Type ${type} not supported.`);
  }
}
