import { loadData } from "../dist/index.js"

const simpleData = await loadData("./examples/data/employees.csv", { logOptions: true })

simpleData
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .checkValues()
    .excludeMissingValues("name")
    .excludeMissingValues("onAllKeys")

// console.log("\n***\nHere's the final data:")
// simpleData.showTable({ logs: true })


