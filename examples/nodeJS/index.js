import { loadData, SimpleData } from "simple-data-analysis"
import { temporaryDirectory } from 'tempy'

const simpleData = await loadData("./data/employees.csv")

simpleData.setDefaultOptions({ logs: true, logOptions: true, logParameters: true })

// console.log(simpleData.data)
// console.log(simpleData.keys)
// console.log(simpleData.options)
simpleData.getArray("Name")
simpleData.getUniqueValues("Job")


simpleData
    .describe({ showDataNoOverwrite: true })
    .formatAllKeys()
    .renameKey("departementOrUnit", "unit")
    .renameKey("endOfYearBonus", "bonus")
    .checkValues({ showDataNoOverwrite: true })
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
    .selectKeys(["firstName", "job", "bonus"], { showDataNoOverwrite: true })

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

simpleData
    .addItems(moreEmployeesSimpleData)

const unitsNames = [
    {
        unit: "30",
        unitName: "Marketing"
    },
    {
        unit: "100",
        unitName: "Finance"
    }
]

simpleData.mergeItems(unitsNames, "unit")
    .removeKey("unitName", { logs: false })

const unitsNamesSimpleData = new SimpleData([
    {
        unit: "30",
        unitName: "Marketing"
    },
    {
        unit: "100",
        unitName: "Finance"
    },
    {
        unit: "60",
        unitName: "Engineering"
    }
])

simpleData.mergeItems(unitsNamesSimpleData, "unit")

simpleData
    .setDefaultOptions({ nbItemInTable: "all" })
    .addQuantiles("bonus", "salaryQuintile", 5)
    .addBins("bonus", "salaryBins", 5)
    .addOutliers("bonus", "bonusOutlier", "boxplot")
    .excludeOutliers("bonus", "boxplot")
    .setDefaultOptions({ showDataNoOverwrite: true })
    .correlation()
    .correlation("salary", "bonus")
    .summarize()
    .summarize(simpleData.keys, "job")
    .summarize("salary", ["job", "unit"])
    .summarize("salary", "job", "mean")
    .summarize("salary", undefined, "mean")
    .summarize("salary", "job", ["mean", "median"])
    .summarize("salary", "job", "weightedMean", "bonus")

const tempDir = temporaryDirectory()

simpleData
    .saveData(`${tempDir}/integrationTest.csv`)
    .saveData(`${tempDir}/integrationTest.json`)

simpleData.saveChart(`${tempDir}/dot1.html`, "dot", "salary", "bonus")
simpleData.saveChart(`${tempDir}/dot2.html`, "dot", "salary", "bonus", "job")

simpleData.valuesToDate("hireDate", "%Y-%m-%d")

simpleData.saveChart(`${tempDir}/line1.html`, "line", "hireDate", "salary")
simpleData.saveChart(`${tempDir}/line2.html`, "line", "hireDate", "salary", "unit")
simpleData.saveChart(`${tempDir}/bar1.html`, "bar", "unit", "salary")
simpleData.saveChart(`${tempDir}/bar2.html`, "bar", "unit", "salary", "unit")
simpleData.saveChart(`${tempDir}/box1.html`, "box", "unit", "salary")
simpleData.saveChart(`${tempDir}/box2.html`, "box", "unit", "salary", "unit")


import * as Plot from "@observablehq/plot"

simpleData
    .saveCustomChart(
        `${tempDir}/customChart.html`,
        {
            grid: true,
            facet: {
                data: simpleData.data,
                y: "unit"
            },
            marks: [
                Plot.dotX(simpleData.data, { x: "salary", fill: "unit" })
            ]
        }
    )