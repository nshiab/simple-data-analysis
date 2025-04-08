import type SimpleTable from "../class/SimpleTable.ts";

export default async function stringifyDates(
  simpleTable: SimpleTable,
  types: { [key: string]: string },
) {
  const typesKeys = Object.keys(types);
  const typesValues = Object.values(types);
  const toConvert: { [key: string]: "string" } = {};
  for (let i = 0; i < typesKeys.length; i++) {
    if (typesValues[i] === "TIMESTAMP" || typesValues[i] === "DATE") {
      toConvert[typesKeys[i]] = "string";
    }
  }
  if (Object.keys(toConvert).length > 0) {
    await simpleTable.convert(toConvert, { datetimeFormat: "%xT%T.%g%z" });
    await simpleTable.replace(Object.keys(toConvert), { "+00": "Z" });
  }
}
