import SimpleWebTable from "../class/SimpleWebTable.js"
import getIdenticalColumns from "../helpers/getIdenticalColumns.js"
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
    const leftTableColumns = await leftTable.getColumns()
    const rightTableColumns = await rightTable.getColumns()

    let commonColumn: string | undefined
    if (options.commonColumn) {
        commonColumn = options.commonColumn
    } else {
        commonColumn = leftTableColumns.find((d) =>
            rightTableColumns.includes(d)
        )
        if (commonColumn === undefined) {
            throw new Error("No common column")
        }
    }

    const identicalColumns = (
        await getIdenticalColumns(leftTableColumns, rightTableColumns)
    ).filter((d) => d !== commonColumn)
    if (identicalColumns.length > 0) {
        throw new Error(
            `The tables have columns with identical names (excluding the columns "${commonColumn}" used for the join). Rename or remove ${identicalColumns.map((d) => `"${d}"`).join(", ")} in one of the two tables before doing the join.`
        )
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
            ? leftTable.sdb.newTable(options.outputTable, leftTable.projections) // missing projections here...
            : leftTable

    // So we reassign here
    const allProjections = {
        ...leftTable.projections,
        ...rightTable.projections,
    }
    outputTable.projections = allProjections

    // Need to remove the extra common column. Ideally, this would happen in the query. :1 is with web assembly version. _1 is with nodejs version. At some point, both will be the same.
    const columns = await outputTable.getColumns()
    const extraCommonColumn = columns.find(
        (d) => d === `${commonColumn}_1` || d === `'${commonColumn}:1'`
    )
    if (extraCommonColumn !== undefined) {
        await outputTable.removeColumns(extraCommonColumn)
    }

    return outputTable
}
