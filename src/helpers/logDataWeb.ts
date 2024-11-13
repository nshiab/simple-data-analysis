export default function logDataWeb(
  types: { [key: string]: string },
  data:
    | {
      [key: string]: string | number | boolean | Date | null;
    }[]
    | null,
  nbCharactersToLog?: number,
) {
  if (data === null) {
    console.log("Data is null");
  } else {
    if (data.length === 0) {
      console.table(data);
    } else {
      const dataToBeLogged: {
        [key: string]: string | number | boolean | Date | null;
      }[] = [];
      const keys = Object.keys(data[0]);
      for (let i = 0; i < data.length; i++) {
        const newItem: {
          [key: string]: string | number | boolean | Date | null;
        } = {};
        for (const key of keys) {
          if (
            typeof nbCharactersToLog === "number" &&
            typeof data[i][key] === "string" &&
            (data[i][key] as string).length > nbCharactersToLog
          ) {
            newItem[key] = (data[i][key] as string).slice(
              0,
              nbCharactersToLog,
            ) + "..."; // tested above
          } else {
            newItem[key] = data[i][key];
          }
        }
        dataToBeLogged.push(newItem);
      }
      const columns = Object.keys(types);
      if (columns.length > 0) {
        for (const col of columns) {
          types[col] = types[col] + "/" + typeof data[0][col];
        }
        console.table([types]);
      }
      console.table(dataToBeLogged);
    }
  }
}
