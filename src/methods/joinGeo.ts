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
    let columnLeftTable = options.columnLeftTable ?? "geom"
    let columnRightTable = options.columnRightTable ?? "geom"

    if (columnLeftTable === columnRightTable) {
        const newColumnLeftTable = `${columnLeftTable}${capitalize(leftTable)}`
        const newColumnRightTable = `${columnRightTable}${capitalize(rightTable)}`

        const leftObj: { [key: string]: string } = {}
        leftObj[columnLeftTable] = newColumnLeftTable
        await simpleDB.renameColumns(leftTable, leftObj)

        const rightObj: { [key: string]: string } = {}
        rightObj[columnRightTable] = newColumnRightTable
        await simpleDB.renameColumns(rightTable, rightObj)

        columnLeftTable = newColumnLeftTable
        columnRightTable = newColumnRightTable
    }

    const type = options.type ?? "left"
    const outputTable = options.outputTable ?? leftTable

    await queryDB(
        simpleDB,
        joinGeoQuery(
            leftTable,
            columnLeftTable,
            method,
            rightTable,
            columnRightTable,
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
}
