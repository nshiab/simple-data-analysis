import { loadData } from "../dist/index.js"

const simpleData = await loadData("./examples/data/employees.csv", { logs: true, logOptions: true })

simpleData
    .formatAllKeys({ logs: true })
    .renameKey("departementOrUnit", "unit", { logs: true })
    .checkValues({ logs: true })
    .excludeMissingValues("onAllKeys", { logs: true })

// console.log("\n***\nHere's the final data:")
// simpleData.showTable({ logs: true })


