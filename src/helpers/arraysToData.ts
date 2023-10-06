import { Table } from "apache-arrow"

export default function tableToArrayOfObjects(table: Table) {
    return table.toArray().map((d) => Object.fromEntries(d))
}
