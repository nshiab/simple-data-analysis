import { SimpleData, SimpleDocument, Table } from "../../src/index.js"
import React from "react"
import { Typography } from "@mui/material"
import { temporaryDirectoryTask } from 'tempy'

const simpleData = new SimpleData([
    { name: "Nael", job: "Producer", variable1: 345, variable2: 56 },
    { name: "Isabelle", job: "Data scientist", variable1: 123, variable2: 432 }])

simpleData.showTable()

temporaryDirectoryTask((tempDir) => {
    new SimpleDocument()
    .add(<h1>Basic HTML element</h1>)
    .add(<p style={{ color: "Red" }}>Much <span style={{ backgroundColor: "blue", fontWeight: "bold" }}>fancier</span> html element</p>)
    .add(<Typography>A MUI component!</Typography>)
    .add(<Table keys={simpleData.keys} data={simpleData.data} />)
    .add(simpleData.saveChart({path: "../DocumentChart1.html", type: "dot", x: "variable1", y: "variable2", color: "job"}))
    .saveDocument(`${tempDir}/analysis.html`)
    .saveDocument(`${tempDir}/analysis.js`)
})