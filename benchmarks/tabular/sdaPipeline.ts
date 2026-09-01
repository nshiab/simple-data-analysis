import type SimpleDB from "../../src/class/SimpleDB.ts";

export default async function runTabularSdaPipeline(
  sdb: SimpleDB,
  paths: {
    input: string;
    cleanOutput: string;
    resultOutput: string;
  },
): Promise<void> {
  const temperatures = sdb.newTable("temperatures");
  temperatures
    .loadData(paths.input, {
      allText: true,
      columns: ["time", "station", "station_name", "tas"],
    })
    .removeMissing({ columns: "tas" })
    .convert({ tas: "double", time: "date" })
    .addColumn("decade", "integer", "FLOOR(YEAR(time) / 10) * 10");
  await temperatures.writeData(paths.cleanOutput);
  temperatures
    .summarize({
      columns: "tas",
      by: ["station", "station_name", "decade"],
      stats: "mean",
    })
    .sort({ station: "asc", station_name: "asc", decade: "asc" });
  await temperatures.writeData(paths.resultOutput);
}
