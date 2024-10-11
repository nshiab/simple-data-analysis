import { dataToArrays } from "jsr:@nshiab/journalism@1";
import type SimpleTable from "../class/SimpleTable.ts";
import getExtension from "./getExtension.ts";
import { writeFileSync } from "node:fs";

export default async function writeDataAsArrays(
  simpleTable: SimpleTable,
  file: string,
) {
  simpleTable.debug && console.log("\nwriteDataAsArrays");
  const fileExtension = getExtension(file);
  if (fileExtension === "json") {
    const data = await simpleTable.getData();
    writeFileSync(file, JSON.stringify(dataToArrays(data)));
  } else {
    throw new Error("The option dataAsArrays works only with json files.");
  }
  simpleTable.debug && console.log("Done.");
}
