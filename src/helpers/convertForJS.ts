export default function convertForJS(rows: {
  [key: string]: string | number | boolean | Date | null;
}[], types: {
  [key: string]: string;
}) {
  if (rows[0] !== undefined) {
    const firstObjectKeys = Object.keys(rows[0]);
    for (const key of Object.keys(types)) {
      if (!firstObjectKeys.includes(key)) {
        continue;
      }
      if (types[key] === "DATE") {
        for (const row of rows) {
          row[key] = row[key] === null
            ? null
            : new Date(`${row[key]}T00:00:00.000Z`);
        }
      } else if (types[key] === "TIMESTAMP") {
        for (const row of rows) {
          row[key] = row[key] === null
            ? null
            : new Date((row[key] as string).replace(" ", "T") + "Z");
        }
      } else if (types[key] === "BIGINT" || types[key] === "HUGEINT") {
        for (const row of rows) {
          row[key] = row[key] === null ? null : Number(row[key]);
        }
      } else if (types[key] === "GEOMETRY") {
        for (const row of rows) {
          row[key] = row[key] === null ? null : "<Geometry>";
        }
      }
    }
  }
}
