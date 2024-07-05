import { capitalize } from "journalism"
import SimpleWebTable from "../class/SimpleWebTable.js"
import findGeoColumn from "../helpers/findGeoColumn.js"
import getIdenticalColumns from "../helpers/getIdenticalColumns.js"
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

    const commonColumn =
        leftTableColumn === rightTableColumn ? leftTableColumn : ""
    const identicalColumns = (
        await getIdenticalColumns(
            await leftTable.getColumns(),
            await rightTable.getColumns()
        )
    ).filter((d) => d !== commonColumn)
    if (identicalColumns.length > 0) {
        throw new Error(
            `The tables have columns with identical names ${commonColumn !== "" ? `(excluding the columns "${commonColumn}" used for the geospatial join)` : ""}. Rename or remove ${identicalColumns.map((d) => `"${d}"`).join(", ")} in one of the two tables before doing the join.`
        )
    }

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
        } else {
            // Otherwise, we don't rename and transfer projections
            rightTableColumnForQuery = `${rightTableColumn}_1`
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

    // Before renaming columns in original tables
    const allProjections = {
        ...leftTable.projections,
        ...rightTable.projections,
    }

    // We bring back the column names for geometries
    if (leftTableColumn === rightTableColumn) {
        if (!leftTable.defaultTableName) {
            const leftObj: { [key: string]: string } = {}
            leftObj[leftTableColumnForQuery] = leftTableColumn
            await leftTable.renameColumns(leftObj)
        }

        // We always changed it.
        const rightObj: { [key: string]: string } = {}
        rightObj[rightTableColumnForQuery] = rightTableColumn
        await rightTable.renameColumns(rightObj)
    }

    if (typeof options.outputTable === "string") {
        return leftTable.sdb.newTable(options.outputTable, allProjections)
    } else {
        leftTable.projections = allProjections
        return leftTable
    }
}
