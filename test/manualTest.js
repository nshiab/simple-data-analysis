import { loadData } from "../dist/index.js"

const simpleData = await loadData("./examples/data/employees.csv", { logOptions: true })

simpleData
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .renameKey("endOfYearBonus", "bonus")
    .checkValues()
    .excludeMissingValues("name")
    .excludeMissingValues()
    .addKey("firstName", item => item.name.split(",")[1].trim())
    .removeKey("name")
    .replaceValues("bonus", "%", "")
    .valuesToInteger("bonus")
    .modifyValues("bonus", item => {
        return item.bonus / 100
    })
    .valuesToFloat("unit")
    .valuesToString("unit")
    .valuesToDate("hireDate", "%d-%b-%y")
    .filterValues("salary", val => val >= 5000)
    .filterItems(item => parseInt(item.unit) * 100 > item.salary)
    .roundValues("salary", { fractionDigits: 2 })


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


