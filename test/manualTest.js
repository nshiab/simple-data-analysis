import { loadData } from "../dist/index.js"

const simpleData = await loadData("./examples/data/employees.csv", { logOptions: true })

const cleanData = simpleData
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .renameKey("endOfYearBonus", "bonus")
    .checkValues()
    .excludeMissingValues("name")
    .excludeMissingValues()
    .cloneData()

console.log("\n*** DATA CLONED ***")

const trainingData = simpleData
    .addKey("firstName", item => item.name.split(",")[1].trim())
    .removeKey("name")
    .replaceValues("bonus", "%", "")
    .replaceValues("bonus", ",", ".")
    .valuesToFloat("bonus")
    .modifyValues("bonus", val => val / 100)
    .modifyItems("bonus", item => item.salary * item.bonus)
    .roundValues("bonus", { fractionDigits: 2 })
    .valuesToInteger("unit")
    .valuesToString("unit")
    .valuesToDate("hireDate", "%d-%b-%y")
    .datesToString("hireDate", "%Y-%m-%d")
    .filterValues("bonus", val => val >= 100)
    .filterItems(item => item.salary > 3000 && item.unit !== "20")
    .sortValues("salary", "descending")
    .sortValues("bonus", "ascending")
    .addQuantiles("salary", "salaryQuintile", 5)
    .sortValues("salaryQuintile", "ascending", { nbItemInTable: 16 })

// TODO:
// quantile
// correlation

// percentage
// variationPercentage
// percentageOfAllItems

// mergeItems
// addItems

// saveToCsv
// saveToJson

// getArray



