import assert from "assert"
import { SimpleData, SimpleDataNode } from "../../../../src/index.js"

describe("checkValues", function () {
    it("should check the type of values", () => {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "11", key2: 22 },
            { key1: "11", key2: undefined },
            { key1: "11", key2: null },
            { key1: "11", key2: NaN },
            { key1: "11", key2: new Date("coucou") },
            { key1: "11", key2: new Date(Date.UTC(2018, 1, 1)) },
            { key1: "", key2: new Date(Date.UTC(2018, 1, 1)) },
        ]

        const sd = new SimpleData({ data }).checkValues()
        assert.deepStrictEqual(sd.getData(), [
            {
                NaN: "0 | 0%",
                count: 8,
                date: "0 | 0%",
                emptyString: "1 | 13%",
                invalidDate: "0 | 0%",
                key: "key1",
                null: "0 | 0%",
                number: "0 | 0%",
                string: "7 | 88%",
                undefined: "0 | 0%",
                uniques: "3 | 38%",
            },
            {
                NaN: "1 | 13%",
                count: 8,
                date: "2 | 25%",
                emptyString: "0 | 0%",
                invalidDate: "1 | 13%",
                key: "key2",
                null: "1 | 13%",
                number: "2 | 25%",
                string: "0 | 0%",
                undefined: "1 | 13%",
                uniques: "8 | 100%",
            },
        ])
    })

    it("should check the type for the first 500", () => {
        const data: { [key: string]: number | string }[] = []
        for (let i = 0; i < 1000; i++) {
            if (i < 100) {
                data.push({ key1: Math.random() })
            } else {
                data.push({ key1: "coucou" })
            }
        }
        const sd = new SimpleData({ data }).checkValues({ nbItemsToCheck: 500 })
        assert.deepStrictEqual(sd.getData(), [
            {
                key: "key1",
                count: 500,
                uniques: "101 | 20%",
                string: "400 | 80%",
                number: "100 | 20%",
            },
        ])
    })

    it("should check the type for the first random 100", () => {
        const data: { [key: string]: number | string }[] = []
        for (let i = 0; i < 1000; i++) {
            if (i < 100) {
                data.push({ key1: Math.random() })
            } else {
                data.push({ key1: "coucou" })
            }
        }
        const sd = new SimpleData({ data }).checkValues({
            nbItemsToCheck: 100,
            randomize: true,
        })
        assert.deepStrictEqual(sd.getFirst().count, 100)
    })

    it("should check values and all items should have the same keys", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/employees.csv",
        })

        assert.deepStrictEqual(sd.checkValues().getData(), [
            {
                key: "Name",
                count: 51,
                uniques: "50 | 98%",
                string: "47 | 92%",
                number: "0 | 0%",
                emptyString: "1 | 2%",
                NaN: "1 | 2%",
                null: "1 | 2%",
                undefined: "1 | 2%",
            },
            {
                key: "Hire date",
                count: 51,
                uniques: "46 | 90%",
                string: "46 | 90%",
                number: "0 | 0%",
                emptyString: "1 | 2%",
                null: "1 | 2%",
                NaN: "2 | 4%",
                undefined: "1 | 2%",
            },
            {
                key: "Job",
                count: 51,
                uniques: "13 | 25%",
                string: "46 | 90%",
                number: "0 | 0%",
                NaN: "2 | 4%",
                null: "1 | 2%",
                undefined: "1 | 2%",
                emptyString: "1 | 2%",
            },
            {
                key: "Salary",
                count: 51,
                uniques: "36 | 71%",
                string: "48 | 94%",
                number: "0 | 0%",
                NaN: "1 | 2%",
                emptyString: "1 | 2%",
                undefined: "1 | 2%",
                null: "0 | 0%",
            },
            {
                key: "Departement or unit",
                count: 51,
                uniques: "14 | 27%",
                string: "46 | 90%",
                number: "0 | 0%",
                null: "2 | 4%",
                emptyString: "1 | 2%",
                undefined: "1 | 2%",
                NaN: "1 | 2%",
            },
            {
                key: "End-of_year-BONUS?",
                count: 51,
                uniques: "50 | 98%",
                string: "47 | 92%",
                number: "0 | 0%",
                undefined: "1 | 2%",
                NaN: "1 | 2%",
                null: "1 | 2%",
                emptyString: "1 | 2%",
            },
        ])
    })
})
