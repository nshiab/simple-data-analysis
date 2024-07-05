export default async function getIdenticalColumns(
    table1Columns: string[],
    table2Columns: string[]
) {
    const identicalColumns: string[] = []

    table1Columns.some((d) => {
        const test = table2Columns.includes(d)
        if (test) {
            identicalColumns.push(d)
        }
        return test
    })

    return identicalColumns
}
