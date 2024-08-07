import { SimpleDB } from "simple-data-analysis";
import { prettyDuration } from "journalism";

const start = Date.now();

const sdb = new SimpleDB();

const table = await sdb
  .newTable()
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv"
  );

await table.logTable();

prettyDuration(start, { log: true, prefix: "\nDone in " });
