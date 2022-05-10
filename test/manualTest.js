import { loadData, SimpleData } from "../dist/index.js"

const simpleData = await loadData("./examples/data/employees.csv", { logs: true, logOptions: true })

simpleData
    .setDefaultOptions({ logs: true })
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .renameKey("endOfYearBonus", "bonus")
    .checkValues()
    .excludeMissingValues("name")
    .excludeMissingValues()
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
    .filterItems(item => item.hireDate > "2002-01-01" && item.unit !== "20")
    .sortValues("salary", "descending")
    .sortValues("bonus", "ascending")


const moreEmployees = [
    {
        hireDate: "2022-05-12",
        job: "Clerk",
        salary: 2345,
        unit: "30",
        bonus: 10,
        firstName: "Marc"
    },
    {
        hireDate: "2022-02-03",
        job: "Manager",
        salary: 8500,
        unit: "50",
        bonus: 550,
        firstName: "Emily"
    }
]

simpleData.addItems(moreEmployees)

// simpleData
//     .addQuantiles("bonus", "salaryQuintile", 5)
//     .addBins("bonus", "salaryBins", 5)
//     .addOutliers("bonus", "bonusOutlier", "boxplot", { nbItemInTable: "all" })
//     .excludeOutliers("bonus", "boxplot", { nbItemInTable: "all" })



// simpleData.cloneData({ logs: false }).correlation("salary", "bonus")

// simpleData.cloneData({ logs: false }).correlation()


// // CLONE

// // TODO:
// // correlation https://simplestatistics.org/docs/#linearregression

// // percentage
// // variationPercentage
// // percentageOfAllItems

// // mergeItems
// // addItems

// // saveToCsv
// // saveToJson

// // getArray



