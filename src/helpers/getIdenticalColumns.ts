export default function getIdenticalColumns(
    table1Columns: string[],
    table2Columns: string[]
) {
    return table1Columns.filter((column) => table2Columns.includes(column))
}
