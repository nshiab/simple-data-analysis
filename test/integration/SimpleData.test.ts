import { JSDOM } from "jsdom"
const jsdom = new JSDOM("")
global.document = jsdom.window.document

import { SimpleData } from "../../src/indexWeb.js"
import * as Plot from "@observablehq/plot"

import employees from "../../data/employees.json" assert { type: "json" }

async function main() {
    new SimpleData({
        data: [
            { first: "Nael", last: "Shiab" },
            { first: "Isabelle", last: "Bouchard" },
        ],
        verbose: true,
        logParameters: true,
    })

    const simpleData = await new SimpleData({
        data: employees,
        fillMissingKeys: true,
        verbose: true,
        logParameters: true,
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

    simpleData
        .describe({ overwrite: false })
        .formatAllKeys()
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
        .removeKey({ key: "name" })
        .replaceStringValues({
            key: "bonus",
            oldValue: "%",
            newValue: "",
            method: "partialString",
        })
        .replaceStringValues({
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
        .valuesToString({ key: "unit" })
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
        .valuesToKeys({ newKeys: "unit", newValues: "bonus" })
        .keysToValues({
            keys: ["30", "40", "50", "60", "100", "110"],
            newKeyForKeys: "unit",
            newKeyForValues: "bonus",
        })

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

    simpleData.addItems({ dataToBeAdded: moreEmployees })

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

    simpleData.addItems({ dataToBeAdded: moreEmployeesSimpleData })

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

    simpleData
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

    simpleData.mergeItems({
        dataToBeMerged: unitsNamesSimpleData,
        commonKey: "unit",
    })

    simpleData
        .addQuantiles({
            key: "bonus",
            newKey: "salaryQuintile",
            nbQuantiles: 5,
        })
        .addBins({ key: "bonus", newKey: "salaryBins", nbBins: 5 })
        .addOutliers({ key: "bonus", newKey: "bonusOutlier" })
        .excludeOutliers({ key: "bonus" })
        .addPercentageDistribution({
            method: "item",
            keys: ["salary", "bonus"],
            overwrite: false,
        })
        .addPercentageDistribution({
            method: "data",
            key: "salary",
            newKey: "salaryPercent",
            overwrite: false,
            nbDigits: 5,
        })
        .addPercentageDistribution({
            method: "data",
            key: "salary",
            groupKeys: ["unitName", "job"],
            newKey: "salaryPercent",
            overwrite: false,
            nbDigits: 5,
        })
        .correlation({ overwrite: false })
        .correlation({ key1: "salary", key2: "bonus", overwrite: false })
        .summarize({ overwrite: false })
        .summarize({
            keyValue: simpleData.getKeys(),
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

    simpleData.valuesToDate({ key: "hireDate", format: "%Y-%m-%d" })

    simpleData.getChart({ type: "line", x: "hireDate", y: "salary" })
    simpleData.getChart({
        type: "line",
        x: "hireDate",
        y: "salary",
        color: "unit",
    })
    simpleData.getChart({ type: "bar", x: "unit", y: "salary" })
    simpleData.getChart({ type: "bar", x: "unit", y: "salary", color: "unit" })
    simpleData.getChart({ type: "box", x: "unit", y: "salary" })
    simpleData.getChart({ type: "box", x: "unit", y: "salary", color: "unit" })

    simpleData.getCustomChart({
        plotOptions: {
            color: { type: "ordinal" },
            grid: true,
            facet: {
                data: simpleData.getData(),
                y: "unit",
            },
            marks: [
                Plot.dotX(simpleData.getData(), { x: "salary", fill: "unit" }),
            ],
        },
    })
}

main()
