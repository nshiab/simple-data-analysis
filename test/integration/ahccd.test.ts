import SimpleDB from "../../src/class/SimpleDB.ts";
import { existsSync, mkdirSync } from "node:fs";

if (existsSync("test/data/files/ahccd.csv")) {
  const output = "./test/output/";
  if (!existsSync(output)) {
    mkdirSync(output);
  }

  Deno.test("should run the SDA performance benchmark", async () => {
    const startTotal = Date.now();
    const sdb = new SimpleDB();
    const table = sdb.newTable();

    // Loading
    const startImporting = Date.now();
    await table.loadData(`test/data/files/ahccd.csv`, { allText: true });
    const endImporting = Date.now();
    console.log(
      "Importing duration",
      (endImporting - startImporting) / 1000,
      "sec",
    );

    // Cleaning
    const startCleaning = Date.now();
    await table.selectColumns(["time", "station", "station_name", "tas"]);
    await table.removeMissing({ columns: "tas" });
    await table.convert({ tas: "double", time: "date" });
    const endCleaning = Date.now();
    console.log(
      "Cleaning duration",
      (endCleaning - startCleaning) / 1000,
      "sec",
    );

    // Modifying
    const startModifying = Date.now();
    await table.addColumn("decade", "integer", `FLOOR(YEAR(time) / 10)*10`);
    const endModifying = Date.now();
    console.log(
      "Modifying duration",
      (endModifying - startModifying) / 1000,
      "sec",
    );

    // Writing clean data
    const startWriting = Date.now();
    await table.writeData(
      `./test/output/cleaned_ahccd.csv`,
    );
    const endWriting = Date.now();
    console.log("Writing duration", (endWriting - startWriting) / 1000, "sec");

    // Summarizing
    const startSummarizing = Date.now();
    await table.summarize({
      values: "tas",
      categories: ["station", "station_name", "decade"],
      summaries: "mean",
    });
    const endSummarizing = Date.now();
    console.log(
      "Summarizing duration",
      (endSummarizing - startSummarizing) / 1000,
      "sec",
    );

    const endTotal = Date.now();
    console.log("Total duration", (endTotal - startTotal) / 1000, "sec");
  });
} else {
  console.log("No ahccd.csv file found. Skipping ahccd.test.ts.");
}
