import { loadData, SimpleData } from "../../dist/index.js"

const simpleData = await loadData("data/employees.csv", { logs: true, logOptions: true })

console.log(simpleData.getData())
console.log(simpleData.getKeys())
console.log(simpleData.getArray("Name"))
console.log(simpleData.getUniqueValues("Job"))


simpleData
    .setDefaultOptions({ logs: true })
    .describe()
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .renameKey("endOfYearBonus", "bonus")
    .checkValues()
    .excludeMissingValues("name")
    .excludeMissingValues()
    .addKey("firstName", item => item.name.split(",")[1].trim())
    .removeKey("name")
    .replaceValues("bonus", "%", "", "partialString")
    .replaceValues("bonus", ",", ".", "partialString")
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

const moreEmployeesSimpleData = new SimpleData([
    {
        hireDate: "2021-11-23",
        job: "Accountant",
        salary: 7845,
        unit: "30",
        bonus: 1150,
        firstName: "Roberto"
    },
    {
        hireDate: "2022-02-03",
        job: "Accountant",
        salary: 8000,
        unit: "50",
        bonus: 130,
        firstName: "Maxime"
    }
])

simpleData.addItems(moreEmployeesSimpleData)


simpleData
    .addQuantiles("bonus", "salaryQuintile", 5)
    .addBins("bonus", "salaryBins", 5)
    .addOutliers("bonus", "bonusOutlier", "boxplot", { nbItemInTable: "all" })
    .excludeOutliers("bonus", "boxplot", { nbItemInTable: "all" })

simpleData.setDefaultOptions({ logs: false, nbItemInTable: "all" })

simpleData
    .clone()
    .correlation("salary", "bonus")
    .showTable()

simpleData
    .clone()
    .correlation()
    .showTable()

simpleData
    .clone()
    .summarize()
    .showTable()

simpleData
    .clone()
    .summarize(simpleData.getKeys(), "job")
    .showTable()

simpleData
    .clone()
    .summarize("salary", ["job", "unit"])
    .showTable()

simpleData
    .clone()
    .summarize("salary", "job", "mean")
    .showTable()

simpleData
    .clone()
    .summarize("salary", undefined, "mean")
    .showTable()


simpleData
    .clone()
    .summarize("salary", "job", ["mean", "median"])
    .showTable()

simpleData
    .clone()
    .summarize("salary", "job", "weightedMean", "bonus")
    .showTable()

// // TODO:

// // percentage
// // variationPercentage
// // percentageOfAllItems

// // mergeItems

// // saveToCsv
// // saveToJson
