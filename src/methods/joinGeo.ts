import SimpleDB from "../class/SimpleDB.js"
import capitalize from "../helpers/capitalize.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import joinGeoQuery from "./joinGeoQuery.js"

export default async function joinGeo(
    simpleDB: SimpleDB,
    leftTable: string,
    method: "intersect" | "inside",
    rightTable: string,
    options: {
        columnLeftTable?: string
        columnRightTable?: string
        type?: "inner" | "left" | "right" | "full"
        outputTable?: string
    } = {}
) {
    const columnLeftTable = options.columnLeftTable ?? "geom"
    const columnRightTable = options.columnRightTable ?? "geom"
    let columnLeftTableForQuery = columnLeftTable
    let columnRightTableForQuery = columnRightTable

    // We change the column names for geometries
    if (columnLeftTable === columnRightTable) {
        columnLeftTableForQuery = `${columnLeftTable}${capitalize(leftTable)}`
        columnRightTableForQuery = `${columnRightTable}${capitalize(rightTable)}`

        const leftObj: { [key: string]: string } = {}
        leftObj[columnLeftTable] = columnLeftTableForQuery
        await simpleDB.renameColumns(leftTable, leftObj)

        const rightObj: { [key: string]: string } = {}
        rightObj[columnRightTable] = columnRightTableForQuery
        await simpleDB.renameColumns(rightTable, rightObj)
    }

    const type = options.type ?? "left"
    const outputTable = options.outputTable ?? leftTable

    await queryDB(
        simpleDB,
        joinGeoQuery(
            leftTable,
            columnLeftTableForQuery,
            method,
            rightTable,
            columnRightTableForQuery,
            type,
            outputTable
        ),
        mergeOptions(simpleDB, {
            table: outputTable,
            method: "joinGeo()",
            parameters: {
                leftTable,
                method,
                rightTable,
                options,
            },
        })
    )

    // We bring back the column names for geometries
    if (columnLeftTable === columnRightTable) {
        const leftObj: { [key: string]: string } = {}
        leftObj[columnLeftTableForQuery] = columnLeftTable
        await simpleDB.renameColumns(leftTable, leftObj)

        const rightObj: { [key: string]: string } = {}
        rightObj[columnRightTableForQuery] = columnRightTable
        await simpleDB.renameColumns(rightTable, rightObj)
    }
}
