import type { Table } from "npm:apache-arrow@17";

export default function tableToArrayOfObjects(table: Table) {
  return table.toArray().map((d) => Object.fromEntries(d));
}
