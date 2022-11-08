import { JSDOM } from "jsdom"
if (global.window === undefined || global.document === undefined) {
    const jsdom = new JSDOM("")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window = jsdom.window
    global.document = jsdom.window.document
}

import { SimpleData } from "../../src/index.js"
import * as Plot from "@observablehq/plot"

import employees from "../../data/employees.json" assert { type: "json" }

const args = process.argv
const noLogs = args[2] === "noLogs"
console.log("noLogs =>", noLogs)

main()

async function main() {
    new SimpleData().getKeys()

    new SimpleData({
        data: [
            { first: "Nael", last: "Shiab" },
            { first: "Isabelle", last: "Bouchard" },
        ],
        verbose: true,
        logParameters: true,
        noLogs: noLogs,
    })

    const simpleData = new SimpleData({
        data: employees,
        fillMissingKeys: true,
        verbose: true,
        logParameters: true,
        noLogs: noLogs,
    })

    // Can't use fetch with node
    // .loadDataFromUrl({
    //     url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/data/employees.csv",
    // })

    simpleData.getData()
    simpleData.getDataAsArrays()
    simpleData.getKeys()

    simpleData.getArray({ key: "Name" })
    simpleData.getUniqueValues({ key: "Job" })
    simpleData.getItem({ conditions: { Name: "Seo, John" } })

    const simpleDataClone = simpleData
        .describe({ overwrite: false })
        .formatAllKeys()
        .clone()
        .renameKey({ oldKey: "departementOrUnit", newKey: "unit" })
        .renameKey({ oldKey: "endOfYearBonus", newKey: "bonus" })
        .checkValues({ overwrite: false })
        .removeDuplicates()
        .keepMissingValues({ key: "name", overwrite: false })
        .excludeMissingValues({ key: "name" })
        .excludeMissingValues()
        .addKey({
            key: "firstName",
            itemGenerator: (item) => {
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
        .addRank({
            newKey: "firstNameRank",
            key: "firstName",
        })
        .removeKey({ key: "firstNameRank" })
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
        .showDuration()
        .modifyItems({
            key: "bonus",
            itemGenerator: (item) =>
                typeof item.salary === "number" &&
                typeof item.bonus === "number"
                    ? item.salary * item.bonus
                    : NaN,
        })
        .roundValues({ key: "bonus", nbDigits: 2 })
        .valuesToString({ key: "unit" })
        .valuesToInteger({ key: "unit" })
        .valuesToString({ key: "unit" })
        .filterValues({
            key: "hireDate",
            valueComparator: (hireDate) => hireDate !== "07-ARB-07",
        })
        .valuesToDate({ key: "hireDate", format: "%d-%b-%y" })
        .datesToString({
            key: "hireDate",
            format: "%Y-%m-%d",
            skipErrors: true,
        })
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
        .valuesToKeys({ newKeys: "unit", newValues: "bonus" })
        .keysToValues({
            keys: ["30", "40", "50", "60", "100", "110"],
            newKeyForKeys: "unit",
            newKeyForValues: "bonus",
        })
        .pickRandomItems({ nbItems: 3 })

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

    simpleDataClone.addItems({ dataToBeAdded: moreEmployees })

    const moreEmployeesSimpleData = new SimpleData({
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

    simpleDataClone.addItems({ dataToBeAdded: moreEmployeesSimpleData })

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

    const simpleDataMerged = simpleDataClone
        .clone()
        .mergeItems({ dataToBeMerged: unitsNames, commonKey: "unit" })
        .removeKey({ key: "unitName" })

    const unitsNamesSimpleData = new SimpleData({
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

    simpleDataMerged.mergeItems({
        dataToBeMerged: unitsNamesSimpleData,
        commonKey: "unit",
    })

    simpleDataMerged
        .addQuantiles({
            key: "bonus",
            newKey: "salaryQuintile",
            nbQuantiles: 5,
        })
        .addBins({ key: "bonus", newKey: "salaryBins", nbBins: 5 })
        .addOutliers({ key: "bonus", newKey: "bonusOutlier" })
        .excludeOutliers({ key: "bonus" })
        .addProportions({
            method: "item",
            keys: ["salary", "bonus"],
            overwrite: false,
        })
        .addProportions({
            method: "data",
            key: "salary",
            newKey: "salaryPercent",
            overwrite: false,
            nbDigits: 5,
        })
        .addProportions({
            method: "data",
            key: "salary",
            keyCategory: ["unitName", "job"],
            newKey: "salaryPercent",
            overwrite: false,
            nbDigits: 5,
        })
        .addVariation({
            key: "salary",
            newKey: "salaryVariation",
            valueGenerator: (a, b) => (a as number) - (b as number),
            firstValue: 0,
            order: "ascending",
            overwrite: false,
        })
        .correlation({ overwrite: false })
        .correlation({ key1: "salary", key2: "bonus", overwrite: false })
        .summarize({ overwrite: false })
        .summarize({
            keyValue: simpleDataMerged.getKeys(),
            keyCategory: "job",
            overwrite: false,
        })
        .summarize({
            keyValue: "salary",
            keyCategory: ["job", "unit"],
            overwrite: false,
        })
        .summarize({
            keyValue: "salary",
            keyCategory: "job",
            summary: "mean",
            overwrite: false,
        })
        .summarize({ keyValue: "salary", summary: "mean", overwrite: false })
        .summarize({
            keyValue: "salary",
            keyCategory: "job",
            summary: ["mean", "median"],
            overwrite: false,
        })
        .summarize({
            keyValue: "salary",
            keyCategory: "job",
            summary: "weightedMean",
            weight: "bonus",
            overwrite: false,
        })

    simpleDataMerged.valuesToDate({ key: "hireDate", format: "%Y-%m-%d" })

    simpleDataMerged.getChart({ type: "line", x: "hireDate", y: "salary" })
    simpleDataMerged.getChart({
        type: "line",
        x: "hireDate",
        y: "salary",
        color: "unit",
        colorScale: "ordinal",
    })
    simpleDataMerged.getChart({ type: "bar", x: "unit", y: "salary" })
    simpleDataMerged.getChart({
        type: "bar",
        x: "unit",
        y: "salary",
        color: "unit",
        colorScale: "ordinal",
    })
    simpleDataMerged.getChart({ type: "box", x: "unit", y: "salary" })
    simpleDataMerged.getChart({
        type: "box",
        x: "unit",
        y: "salary",
        color: "unit",
        colorScale: "ordinal",
    })

    simpleDataMerged.getCustomChart({
        plotOptions: {
            color: { type: "ordinal" },
            grid: true,
            facet: {
                data: simpleDataMerged.getData(),
                y: "unit",
            },
            marks: [
                Plot.dotX(simpleDataMerged.getData(), {
                    x: "salary",
                    fill: "unit",
                }),
            ],
        },
    })

    simpleDataMerged.getDuration()

    simpleDataMerged.showDuration()
}
