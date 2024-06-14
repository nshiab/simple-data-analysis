import SimpleWebTable from "../class/SimpleWebTable.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import joinQuery from "./joinQuery.js"

export default async function join(
    leftTable: SimpleWebTable,
    rightTable: SimpleWebTable,
    options: {
        commonColumn?: string
        type?: "inner" | "left" | "right" | "full"
        outputTable?: string | boolean
    } = {}
) {
    let commonColumn: string | undefined
    if (options.commonColumn) {
        commonColumn = options.commonColumn
    } else {
        const leftTableColumns = await leftTable.getColumns()
        const rightTableColumns = await rightTable.getColumns()
        commonColumn = leftTableColumns.find((d) =>
            rightTableColumns.includes(d)
        )
        if (commonColumn === undefined) {
            throw new Error("No common column")
        }
    }

    await queryDB(
        leftTable,
        joinQuery(
            leftTable.name,
            rightTable.name,
            commonColumn,
            options.type ?? "left",
            typeof options.outputTable === "string"
                ? options.outputTable
                : leftTable.name
        ),
        mergeOptions(leftTable, {
            table:
                typeof options.outputTable === "string"
                    ? options.outputTable
                    : leftTable.name,
            method: "join()",
            parameters: {
                rightTable,
                options,
            },
        })
    )

    const outputTable =
        typeof options.outputTable === "string"
            ? leftTable.sdb.newTable(options.outputTable, leftTable.projection)
            : leftTable

    // Need to remove the extra column common column. Ideally, this would happen in the query. :1 is with web assembly version. _1 is with nodejs version. At some point, both will be the same.
    const columns = await outputTable.getColumns()
    const extraCommonColumn = columns.find(
        (d) => d === `${commonColumn}_1` || d === `'${commonColumn}:1'`
    )
    if (extraCommonColumn !== undefined) {
        await outputTable.removeColumns(extraCommonColumn)
    }
}
