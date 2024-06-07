import SimpleWebTable from "../class/SimpleWebTable.js"
import capitalize from "../helpers/capitalize.js"
import findGeoColumn from "../helpers/findGeoColumn.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import joinGeoQuery from "./joinGeoQuery.js"

export default async function joinGeo(
    leftTable: SimpleWebTable,
    method: "intersect" | "inside" | "within",
    rightTable: SimpleWebTable,
    options: {
        leftTableColumn?: string
        rightTableColumn?: string
        type?: "inner" | "left" | "right" | "full"
        distance?: number
        distanceMethod?: "srs" | "haversine" | "spheroid"
        outputTable?: string | boolean
    } = {}
) {
    const leftTableColumn =
        options.leftTableColumn ?? (await findGeoColumn(leftTable))
    const rightTableColumn =
        options.rightTableColumn ?? (await findGeoColumn(rightTable))
    let leftTableColumnForQuery = leftTableColumn
    let rightTableColumnForQuery = rightTableColumn

    // We change the column names for geometries
    if (leftTableColumn === rightTableColumn) {
        if (!leftTable.defaultTableName) {
            leftTableColumnForQuery = `${leftTableColumn}${capitalize(leftTable.name)}`
            const leftObj: { [key: string]: string } = {}
            leftObj[leftTableColumn] = leftTableColumnForQuery
            await leftTable.renameColumns(leftObj)
        }

        if (!rightTable.defaultTableName) {
            rightTableColumnForQuery = `${rightTableColumn}${capitalize(rightTable.name)}`
            const rightObj: { [key: string]: string } = {}
            rightObj[rightTableColumn] = rightTableColumnForQuery
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
            leftTableColumnForQuery,
            method,
            rightTable.name,
            rightTableColumnForQuery,
            type,
            outputTable,
            options.distance,
            options.distanceMethod
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
    if (leftTableColumn === rightTableColumn) {
        if (!leftTable.defaultTableName) {
            const leftObj: { [key: string]: string } = {}
            leftObj[leftTableColumnForQuery] = leftTableColumn
            await leftTable.renameColumns(leftObj)
        }

        if (!rightTable.defaultTableName) {
            const rightObj: { [key: string]: string } = {}
            rightObj[rightTableColumnForQuery] = rightTableColumn
            await rightTable.renameColumns(rightObj)
        }
    }
}
