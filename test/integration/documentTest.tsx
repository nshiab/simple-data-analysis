import { SimpleData, SimpleDocument } from "../../src/index.js"
import React from "react"
import { Typography } from "@mui/material"

const simpleDocument = new SimpleDocument()
    .add(<h1>Titre super cool</h1>)
    .add(<p>Du contenu extraordinaire</p>)
    .add(<Typography>Une composante mui!</Typography>)
    .saveDocument("../analysis.html")
    .saveDocument("../analysis.js")


// const simpleData = new SimpleData([
//     { name: "Nael", job: "Producer" },
//     { name: "Isabelle", job: "Data scientist" }],
//     {
//         encoding: "utf8",
//         logs: false,
//         logOptions: false,
//         logParameters: false,
//         nbItemInTable: 5,
//         fractionDigits: 0,
//         missingValues: [],
//         missingValuesArray: [],
//         nbValuesTestedForTypeOf: 0,
//         environment: "node",
//         showDataNoOverwrite: false
//     })

// simpleData.showTable()