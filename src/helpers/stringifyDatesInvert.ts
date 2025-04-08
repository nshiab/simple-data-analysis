import type SimpleTable from "../class/SimpleTable.ts";

export default async function stringifyDatesInvert(
  simpleTable: SimpleTable,
  types: { [key: string]: string },
) {
  const typesKeys = Object.keys(types);
  const typesValues = Object.values(types);
  const toConvertBack: { [key: string]: "timestamp" | "date" } = {};
  for (let i = 0; i < typesKeys.length; i++) {
    if (typesValues[i] === "TIMESTAMP" || typesValues[i] === "DATE") {
      toConvertBack[typesKeys[i]] = typesValues[i].toLowerCase() as
        | "timestamp"
        | "date";
    }
  }
  if (Object.keys(toConvertBack).length > 0) {
    await simpleTable.replace(Object.keys(toConvertBack), { "Z": "+00" });
    await simpleTable.convert(toConvertBack);
  }
}
