import { SimpleWebTable } from "../bundle"

export default async function getIdenticalColumns(
    table1: SimpleWebTable,
    table2: SimpleWebTable
) {
    const identicalColumns: string[] = []
    const table1Columns = await table1.getColumns()
    const table2Columns = await table2.getColumns()

    table1Columns.some((d) => {
        const test = table2Columns.includes(d)
        if (test) {
            identicalColumns.push(d)
        }
        return test
    })

    return identicalColumns
}
