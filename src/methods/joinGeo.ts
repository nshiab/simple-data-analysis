import { capitalize } from "@nshiab/journalism/web";
import type SimpleTable from "../class/SimpleTable.ts";
import findGeoColumn from "../helpers/findGeoColumn.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import joinGeoQuery from "./joinGeoQuery.ts";

export default async function joinGeo(
  leftTable: SimpleTable,
  method: "intersect" | "inside" | "within",
  rightTable: SimpleTable,
  options: {
    leftTableColumn?: string;
    rightTableColumn?: string;
    type?: "inner" | "left" | "right" | "full";
    distance?: number;
    distanceMethod?: "srs" | "haversine" | "spheroid";
    outputTable?: string | boolean;
  } = {},
) {
  const leftTableColumn = options.leftTableColumn ??
    (await findGeoColumn(leftTable));
  const rightTableColumn = options.rightTableColumn ??
    (await findGeoColumn(rightTable));

  const commonColumn = leftTableColumn === rightTableColumn
    ? leftTableColumn
    : "";
  const identicalColumns = (
    getIdenticalColumns(
      await leftTable.getColumns(),
      await rightTable.getColumns(),
    )
  ).filter((d) => d !== commonColumn);
  if (identicalColumns.length > 0) {
    throw new Error(
      `The tables have columns with identical names ${
        commonColumn !== ""
          ? `(excluding the columns "${commonColumn}" used for the geospatial join)`
          : ""
      }. Rename or remove ${
        identicalColumns.map((d) => `"${d}"`).join(", ")
      } in one of the two tables before doing the join.`,
    );
  }

  let leftTableColumnForQuery = leftTableColumn;
  let rightTableColumnForQuery = rightTableColumn;

  // We change the column names for geometries
  if (leftTableColumn === rightTableColumn) {
    leftTableColumnForQuery = `${leftTableColumn}${capitalize(leftTable.name)}`;
    const leftObj: { [key: string]: string } = {};
    leftObj[leftTableColumn] = leftTableColumnForQuery;
    await leftTable.renameColumns(leftObj);

    rightTableColumnForQuery = `${rightTableColumn}${
      capitalize(rightTable.name)
    }`;
    const rightObj: { [key: string]: string } = {};
    rightObj[rightTableColumn] = rightTableColumnForQuery;
    await rightTable.renameColumns(rightObj);
  }

  const type = options.type ?? "left";
  const outputTable = typeof options.outputTable === "string"
    ? options.outputTable
    : leftTable.name;

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
      options.distanceMethod,
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
    }),
  );

  // We bring back the column names for geometries
  let allProjections = {};
  if (leftTableColumn === rightTableColumn) {
    const leftObj: { [key: string]: string } = {};
    leftObj[leftTableColumnForQuery] = leftTableColumn;
    await leftTable.renameColumns(leftObj);

    // Before renaming columns in original tables
    allProjections = {
      ...leftTable.projections,
      ...rightTable.projections,
    };

    const rightObj: { [key: string]: string } = {};
    rightObj[rightTableColumnForQuery] = rightTableColumn;
    await rightTable.renameColumns(rightObj);
  } else {
    allProjections = {
      ...leftTable.projections,
      ...rightTable.projections,
    };
  }

  if (typeof options.outputTable === "string") {
    return leftTable.sdb.newTable(options.outputTable, allProjections);
  } else {
    leftTable.projections = allProjections;
    return leftTable;
  }
}
