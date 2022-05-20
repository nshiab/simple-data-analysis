import { SimpleDataNode } from "../../src/index.js"
import { temporaryDirectoryTask } from "tempy"
import * as Plot from "@observablehq/plot"

async function main() {
    new SimpleDataNode({
        data: [
            { first: "Nael", last: "Shiab" },
            { first: "Isabelle", last: "Bouchard" },
        ],
        verbose: true,
        logParameters: true,
    })

    const simpleDataNode = await new SimpleDataNode({
        verbose: true,
        logParameters: true,
    }).loadDataFromUrl({
        url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/data/employees.csv",
    })

    simpleDataNode.getData()
    simpleDataNode.getKeys()

    simpleDataNode.getArray({ key: "Name" })
    simpleDataNode.getUniqueValues({ key: "Job" })

    simpleDataNode
        .describe()
        .formatAllKeys()
        .renameKey({ oldKey: "departementOrUnit", newKey: "unit" })
        .renameKey({ oldKey: "endOfYearBonus", newKey: "bonus" })
        .checkValues()
        .excludeMissingValues({ key: "name" })
        .excludeMissingValues()
        .addKey({
            key: "firstName",
            valueGenerator: (item) => {
                if (typeof item.name === "string") {
                    const nameSplit = item.name.split(",")
                    if (nameSplit[1]) {
                        return nameSplit[1].trim()
                    } else {
                        return item.name
                    }
                } else {
                    return item.name
                }
            },
        })
        .removeKey({ key: "name" })
        .replaceValues({
            key: "bonus",
            oldValue: "%",
            newValue: "",
            method: "partialString",
        })
        .replaceValues({
            key: "bonus",
            oldValue: ",",
            newValue: ".",
            method: "partialString",
        })
        .valuesToFloat({ key: "bonus" })
        .modifyValues({
            key: "bonus",
            valueGenerator: (val) =>
                typeof val === "number" ? val / 100 : NaN,
        })
        .modifyItems({
            key: "bonus",
            itemGenerator: (item) =>
                typeof item.salary === "number" &&
                typeof item.bonus === "number"
                    ? item.salary * item.bonus
                    : NaN,
        })
        .roundValues({ key: "bonus", nbDigits: 2 })
        .valuesToInteger({ key: "unit" })
        .valuesToString({ key: "unit" })
        .valuesToDate({ key: "hireDate", format: "%d-%b-%y" })
        .datesToString({ key: "hireDate", format: "%Y-%m-%d" })
        .filterValues({
            key: "bonus",
            valueComparator: (val) => typeof val === "number" && val >= 100,
        })
        .filterItems({
            itemComparator: (item) =>
                typeof item.hireDate === "string" &&
                item.hireDate > "2002-01-01" &&
                item.unit !== "20",
        })
        .sortValues({ key: "salary", order: "descending" })
        .sortValues({ key: "bonus", order: "ascending" })
        .selectKeys({ keys: ["firstName", "job", "bonus"], overwrite: false })

    const moreEmployees = [
        {
            hireDate: "2022-05-12",
            job: "Clerk",
            salary: 2345,
            unit: "30",
            bonus: 10,
            firstName: "Marc",
        },
        {
            hireDate: "2022-02-03",
            job: "Manager",
            salary: 8500,
            unit: "50",
            bonus: 550,
            firstName: "Emily",
        },
    ]

    simpleDataNode.addItems({ dataToBeAdded: moreEmployees })

    const moreEmployeesSimpleDataNode = new SimpleDataNode({
        data: [
            {
                hireDate: "2021-11-23",
                job: "Accountant",
                salary: 7845,
                unit: "30",
                bonus: 1150,
                firstName: "Roberto",
            },
            {
                hireDate: "2022-02-03",
                job: "Accountant",
                salary: 8000,
                unit: "50",
                bonus: 130,
                firstName: "Maxime",
            },
        ],
    })

    simpleDataNode.addItems({ dataToBeAdded: moreEmployeesSimpleDataNode })

    const unitsNames = [
        {
            unit: "30",
            unitName: "Marketing",
        },
        {
            unit: "100",
            unitName: "Finance",
        },
    ]

    simpleDataNode
        .mergeItems({ dataToBeMerged: unitsNames, commonKey: "unit" })
        .removeKey({ key: "unitName" })

    const unitsNamesSimpleData = new SimpleDataNode({
        data: [
            {
                unit: "30",
                unitName: "Marketing",
            },
            {
                unit: "100",
                unitName: "Finance",
            },
            {
                unit: "60",
                unitName: "Engineering",
            },
        ],
    })

    simpleDataNode.mergeItems({
        dataToBeMerged: unitsNamesSimpleData,
        commonKey: "unit",
    })

    simpleDataNode
        .addQuantiles({
            key: "bonus",
            newKey: "salaryQuintile",
            nbQuantiles: 5,
        })
        .addBins({ key: "bonus", newKey: "salaryBins", nbBins: 5 })
        .addOutliers({ key: "bonus", newKey: "bonusOutlier" })
        .excludeOutliers({ key: "bonus" })
        .correlation()
        .correlation({ key1: "salary", key2: "bonus" })
        .summarize()
        .summarize({ keyValue: simpleDataNode.getKeys(), keyCategory: "job" })
        .summarize({ keyValue: "salary", keyCategory: ["job", "unit"] })
        .summarize({ keyValue: "salary", keyCategory: "job", summary: "mean" })
        .summarize({ keyValue: "salary", summary: "mean" })
        .summarize({
            keyValue: "salary",
            keyCategory: "job",
            summary: ["mean", "median"],
        })
        .summarize({
            keyValue: "salary",
            keyCategory: "job",
            summary: "weightedMean",
            weight: "bonus",
        })

    simpleDataNode.valuesToDate({ key: "hireDate", format: "%Y-%m-%d" })

    temporaryDirectoryTask((tempDir) => {
        simpleDataNode
            .saveData({ path: `${tempDir}/integrationTest.csv` })
            .saveData({ path: `${tempDir}/integrationTest.json` })

        simpleDataNode.saveChart({
            path: `${tempDir}/dot1.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/dot2.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
            color: "job",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/line1.html`,
            type: "line",
            x: "hireDate",
            y: "salary",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/line2.html`,
            type: "line",
            x: "hireDate",
            y: "salary",
            color: "unit",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/bar1.html`,
            type: "bar",
            x: "unit",
            y: "salary",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/bar2.html`,
            type: "bar",
            x: "unit",
            y: "salary",
            color: "unit",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/box1.html`,
            type: "box",
            x: "unit",
            y: "salary",
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/box2.html`,
            type: "box",
            x: "unit",
            y: "salary",
            color: "unit",
        })

        simpleDataNode.saveCustomChart({
            path: `${tempDir}/customChart.html`,
            plotOptions: {
                grid: true,
                facet: {
                    data: simpleDataNode.getData(),
                    y: "unit",
                },
                marks: [
                    Plot.dotX(simpleDataNode.getData(), {
                        x: "salary",
                        fill: "unit",
                    }),
                ],
            },
        })
    })
}

main()
