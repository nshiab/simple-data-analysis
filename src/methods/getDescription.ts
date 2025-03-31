import type SimpleTable from "../class/SimpleTable.ts";

export default async function getDescription(simpleTable: SimpleTable) {
  const types = await simpleTable.getTypes();
  const columns = await simpleTable.getColumns();
  const summaryForGetDescription = await simpleTable.summarize({
    values: columns,
    summaries: ["count", "countUnique", "countNull"],
    toMs: true,
    outputTable: "summaryForGetDescription",
  });
  const summaryData = await summaryForGetDescription.getData();

  await summaryForGetDescription.removeTable();

  const description = summaryData.map((d) => ({
    column: d["value"] as string,
    type: types[d["value"] as string],
    count: d["count"] as number,
    unique: d["countUnique"] as number,
    null: d["countNull"] as number,
  }));

  return description;
}
