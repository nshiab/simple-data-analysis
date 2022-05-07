import { loadData } from "../dist/index.js"

const simpleData = await loadData("./examples/data/employees.csv", { logOptions: true })

simpleData
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .checkValues()
    .excludeMissingValues("name")
    .excludeMissingValues()
    .addKey("firstName", item => item.name.split(",")[1].trim())
    .toString("unit")
    .removeKey("name")

// modifyKey
// toInteger
// toFloat
// toDate
// round
// sum
// substract
// multiply
// divide
// percentage
// variationPercentage
// percentageOfAllItems

// mergeItems
// addItems



// console.log("\n***\nHere's the final data:")
// simpleData.showTable({ logs: true })


