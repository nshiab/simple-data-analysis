import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromHtmlTable", function () {
    it("should return an array of objects from the first table in a webpage", async function () {
        const sd = await new SimpleDataNode().loadDataFromHtmlTable({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/tables/Medieval%20demography%20-%20Wikipedia - one table.html",
            lastItem: 2,
        })

        assert.deepStrictEqual(sd.getData(), [
            {
                "1000": "5.4",
                "1100": "6.4",
                "1200": "7.3",
                "1250": "8",
                "1300": "9.1",
                "1350": "8.5",
                "1400": "9.6",
                "1450": "10.2",
                "1500": "10.8",
                "Country/Region": "German Empire[a]",
            },
            {
                "1000": "9",
                "1100": "11",
                "1200": "13",
                "1250": "15",
                "1300": "17",
                "1350": "15",
                "1400": "14",
                "1450": "14",
                "1500": "15.5",
                "Country/Region": "France",
            },
            {
                "1000": "1.6",
                "1100": "1.8",
                "1200": "2.3",
                "1250": "2.6",
                "1300": "3",
                "1350": "2.4",
                "1400": "3",
                "1450": "3.3",
                "1500": "3.6",
                "Country/Region": "England and Wales",
            },
        ])
    })
    it("should return an array of objects from the nth table in a webpage", async function () {
        const sd = await new SimpleDataNode().loadDataFromHtmlTable({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/tables/Medieval%20demography%20-%20Wikipedia.html",
            tableIndex: 3,
            lastItem: 2,
        })

        assert.deepStrictEqual(sd.getData(), [
            {
                Year: "1000",
                "Total European population,millions": "56.4",
                "Absolute growth per period,millions": "—",
                "Average growth per year,thousands": "—",
                "Absolute growth per century,%": "—",
                "Average growth per year,%": "—",
            },
            {
                Year: "1100",
                "Total European population,millions": "62.1",
                "Absolute growth per period,millions": "5.7",
                "Average growth per year,thousands": "57",
                "Absolute growth per century,%": "10.1",
                "Average growth per year,%": "0.10",
            },
            {
                Year: "1200",
                "Total European population,millions": "68.0",
                "Absolute growth per period,millions": "5.9",
                "Average growth per year,thousands": "59",
                "Absolute growth per century,%": "9.5",
                "Average growth per year,%": "0.09",
            },
        ])
    })
    it("should return an array of objects from a specific table selected in a webpage", async function () {
        const sd = await new SimpleDataNode().loadDataFromHtmlTable({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/tables/Members%20%E2%80%93%20Summary%20of%20Expenditures%20_%20Proactive%20Publication%20of%20Financial%20Information.html",
            tableSelector: "#data-table",
            lastItem: 2,
        })

        assert.deepStrictEqual(sd.getData(), [
            {
                Name: "Aboultaif, Ziad",
                Constituency: "Edmonton Manning",
                Caucus: "Conservative",
                Salaries: "$86,936.08",
                Travel: "$19,042.08",
                Hospitality: "$837.79",
                Contracts: "$22,263.10",
            },
            {
                Name: "Aitchison, Scott",
                Constituency: "Parry Sound—Muskoka",
                Caucus: "Conservative",
                Salaries: "$91,961.93",
                Travel: "$29,366.74",
                Hospitality: "$0.00",
                Contracts: "$43,154.50",
            },
            {
                Name: "Albas, Dan",
                Constituency: "Central Okanagan—Similkameen—Nicola",
                Caucus: "Conservative",
                Salaries: "$92,941.35",
                Travel: "$34,461.93",
                Hospitality: "$1,179.58",
                Contracts: "$29,693.23",
            },
        ])
    })
})
