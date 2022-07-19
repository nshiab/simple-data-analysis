import { JSDOM } from "jsdom"
if (global.window === undefined || global.document === undefined) {
  const jsdom = new JSDOM("")
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.window = jsdom.window
  global.document = jsdom.window.document
}
import { SimpleData, SimpleDocument, Table } from "../../src/index.js";
import React from "react";
import { Typography } from "@mui/material";
import { temporaryDirectoryTask } from "tempy";

const args = process.argv
const noLogs = args[2] === "noLogs"
console.log('noLogs =>', noLogs)

const simpleData = new SimpleData({
  data: [
    { name: "Nael", job: "Producer", variable1: 345, variable2: 56 },
    { name: "Isabelle", job: "Data scientist", variable1: 123, variable2: 432 },
  ],
  noLogs: noLogs
});

simpleData.showTable();

temporaryDirectoryTask((tempDir) => {
  new SimpleDocument({ verbose: true, noLogs: noLogs })
    .add({ component: <h1>Basic HTML element</h1> })
    .add({
      component: (
        <p style={{ color: "Red" }}>
          Much{" "}
          <span style={{ backgroundColor: "blue", fontWeight: "bold" }}>
            fancier
          </span>{" "}
          html element
        </p>
      ),
    })
    .add({ component: <Typography>A MUI component!</Typography> })
    .add({
      component: (
        <Table keys={simpleData.getKeys()} data={simpleData.getData()} />
      ),
    })
    .add({
      component: simpleData.getChart({
        type: "dot",
        x: "variable1",
        y: "variable2",
        color: "job",
      }),
    })
    .saveDocument({ path: `${tempDir}/analysis.html` })
    .saveDocument({ path: `${tempDir}/analysis.js` });
});
