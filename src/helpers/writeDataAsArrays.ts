import { dataToArrays } from "@nshiab/journalism-format";
import type SimpleTable from "../class/SimpleTable.ts";
import getExtension from "./getExtension.ts";
import { writeFileSync } from "node:fs";

export default async function writeDataAsArrays(
  simpleTable: SimpleTable,
  file: string,
) {
  const fileExtension = getExtension(file);
  if (fileExtension === "json") {
    const data = await simpleTable.getData();
    writeFileSync(file, JSON.stringify(dataToArrays(data)));
  } else {
    throw new Error("The option dataAsArrays works only with json files.");
  }
}
