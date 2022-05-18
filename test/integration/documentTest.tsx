import { SimpleData, SimpleDocument, Table } from "../../src/index.js"
import React from "react"
import { Typography } from "@mui/material"
import { temporaryDirectory } from 'tempy'

const simpleData = new SimpleData([
    { name: "Nael", job: "Producer", variable1: 345, variable2: 56 },
    { name: "Isabelle", job: "Data scientist", variable1: 123, variable2: 432 }],
    {
        encoding: "utf8",
        logs: false,
        logOptions: false,
        logParameters: false,
        nbItemInTable: 5,
        fractionDigits: 0,
        missingValues: [],
        missingValuesArray: [],
        nbValuesTestedForTypeOf: 0,
        environment: "node",
        showDataNoOverwrite: false
    })

simpleData.showTable()

const tempDir = temporaryDirectory()

const simpleDocument = new SimpleDocument()
    .add(<h1>Basic HTML element</h1>)
    .add(<p style={{ color: "Red" }}>Much <span style={{ backgroundColor: "blue", fontWeight: "bold" }}>fancier</span> html element</p>)
    .add(<Typography>A MUI component!</Typography>)
    .add(<Table columns={simpleData.keys} rows={simpleData.data} />)
    .add(simpleData.saveChart("../DocumentChart1.html", "dot", "variable1", "variable2", "job"))
    .saveDocument(`${tempDir}/analysis.html`)
    .saveDocument(`${tempDir}/analysis.js`)