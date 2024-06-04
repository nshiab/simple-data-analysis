import SimpleWebTable from "../class/SimpleWebTable.js"
import capitalize from "../helpers/capitalize.js"
import findGeoColumn from "../helpers/findGeoColumn.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import joinGeoQuery from "./joinGeoQuery.js"

export default async function joinGeo(
    leftTable: SimpleWebTable,
    method: "intersect" | "inside",
    rightTable: SimpleWebTable,
    options: {
        columnLeftTable?: string
        columnRightTable?: string
        type?: "inner" | "left" | "right" | "full"
        outputTable?: string | boolean
    } = {}
) {
    const columnLeftTable =
        options.columnLeftTable ?? (await findGeoColumn(leftTable))
    const columnRightTable =
        options.columnRightTable ?? (await findGeoColumn(rightTable))
    let columnLeftTableForQuery = columnLeftTable
    let columnRightTableForQuery = columnRightTable

    // We change the column names for geometries
    if (columnLeftTable === columnRightTable) {
        if (!leftTable.defaultTableName) {
            columnLeftTableForQuery = `${columnLeftTable}${capitalize(leftTable.name)}`
            const leftObj: { [key: string]: string } = {}
            leftObj[columnLeftTable] = columnLeftTableForQuery
            await leftTable.renameColumns(leftObj)
        }

        if (!rightTable.defaultTableName) {
            columnRightTableForQuery = `${columnRightTable}${capitalize(rightTable.name)}`
            const rightObj: { [key: string]: string } = {}
            rightObj[columnRightTable] = columnRightTableForQuery
            await rightTable.renameColumns(rightObj)
        }
    }

    const type = options.type ?? "left"
    const outputTable =
        typeof options.outputTable === "string"
            ? options.outputTable
            : leftTable.name

    await queryDB(
        leftTable,
        joinGeoQuery(
            leftTable.name,
            columnLeftTableForQuery,
            method,
            rightTable.name,
            columnRightTableForQuery,
            type,
            outputTable
        ),
        mergeOptions(leftTable, {
            table: outputTable,
            method: "joinGeo()",
            parameters: {
                leftTable: leftTable.name,
                method,
                rightTable: rightTable.name,
                options,
            },
        })
    )

    // We bring back the column names for geometries
    if (columnLeftTable === columnRightTable) {
        if (!leftTable.defaultTableName) {
            const leftObj: { [key: string]: string } = {}
            leftObj[columnLeftTableForQuery] = columnLeftTable
            await leftTable.renameColumns(leftObj)
        }

        if (!rightTable.defaultTableName) {
            const rightObj: { [key: string]: string } = {}
            rightObj[columnRightTableForQuery] = columnRightTable
            await rightTable.renameColumns(rightObj)
        }
    }
}
