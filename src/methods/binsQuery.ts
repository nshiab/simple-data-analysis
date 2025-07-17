import type SimpleTable from "../class/SimpleTable.ts";

export default async function binsQuery(
  SimpleTable: SimpleTable,
  values: string,
  interval: number,
  newColumn: string,
  options: {
    startValue?: number;
  } = {},
) {
  const minValue = await SimpleTable.getMin(values);
  if (typeof minValue !== "number") {
    throw new Error(`minValue of ${values} is not a number`);
  }

  let startValue = 0;
  if (typeof options.startValue === "number") {
    if (startValue > minValue) {
      throw new Error(
        `startValue ${options.startValue} can't be greater than minValue ${minValue}`,
      );
    }
    startValue = options.startValue;
  } else {
    startValue = minValue;
  }

  const maxValue = await SimpleTable.getMax(values);
  if (typeof maxValue !== "number") {
    throw new Error(`maxValue of ${values} is not a number`);
  }
  const endValue = maxValue;

  let increment = 1;
  let decimals = 0;
  const intervalAsString = interval.toString();
  const decimalIndex = intervalAsString.indexOf(".");
  if (decimalIndex > 0) {
    decimals = intervalAsString.substring(decimalIndex + 1).length;
    increment = 1.0 / (10.0 * decimals);
  }

  const intervals: string[] = [];

  for (let i = startValue; i <= endValue; i += interval) {
    const start = i;
    const end = (i + interval - increment).toFixed(decimals);
    intervals.push(
      `WHEN "${values}" >= ${start} AND "${values}" <= ${end} THEN '[${start}-${end}]'`,
    );
  }

  const query = `ALTER TABLE "${SimpleTable.name}" ADD "${newColumn}" VARCHAR;
    UPDATE "${SimpleTable.name}" SET "${newColumn}" = CASE
    ${intervals.join("\n")}
    END`;

  return query;
}
