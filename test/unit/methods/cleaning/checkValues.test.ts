import assert from "assert"
import checkValues from "../../../../src/methods/cleaning/checkValues.js"
import loadDataFromUrlNode from "../../../../src/methods/importing/loadDataFromUrlNode.js"

describe("checkValues", function () {
    it("should check the type of values", () => {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "11", key2: 22 },
        ]
        const dataChecked = checkValues(data)
        assert.deepEqual(dataChecked, [
            {
                count: 2,
                key: "key1",
                number: 0,
                string: "2 | 100%",
                uniques: "2 | 100%",
            },
            {
                count: 2,
                key: "key2",
                number: "2 | 100%",
                string: 0,
                uniques: "2 | 100%",
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
        const dataChecked = checkValues(data, 500)
        assert.deepEqual(dataChecked, [
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
        const dataChecked = checkValues(data, 100, true)
        assert.deepEqual(dataChecked[0].count, 100)
    })

    it("should check values and all items should have the same keys", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/data/employees.csv",
            false
        )

        const dataChecked = checkValues(data)

        assert.deepEqual(dataChecked, [
            {
                key: "Name",
                count: 51,
                uniques: "50 | 98%",
                string: "48 | 94%",
                number: 0,
                NaN: "1 | 2%",
                null: "1 | 2%",
                undefined: "1 | 2%",
            },
            {
                key: "Hire date",
                count: 51,
                uniques: "46 | 90%",
                string: "47 | 92%",
                number: 0,
                null: "1 | 2%",
                NaN: "2 | 4%",
                undefined: "1 | 2%",
            },
            {
                key: "Job",
                count: 51,
                uniques: "13 | 25%",
                string: "47 | 92%",
                number: 0,
                NaN: "2 | 4%",
                null: "1 | 2%",
                undefined: "1 | 2%",
            },
            {
                key: "Salary",
                count: 51,
                uniques: "36 | 71%",
                string: "49 | 96%",
                number: 0,
                NaN: "1 | 2%",
                undefined: "1 | 2%",
                null: "0 | 0%",
            },
            {
                key: "Departement or unit",
                count: 51,
                uniques: "14 | 27%",
                string: "47 | 92%",
                number: 0,
                null: "2 | 4%",
                undefined: "1 | 2%",
                NaN: "1 | 2%",
            },
            {
                key: "End-of_year-BONUS?",
                count: 51,
                uniques: "50 | 98%",
                string: "48 | 94%",
                number: 0,
                undefined: "1 | 2%",
                NaN: "1 | 2%",
                null: "1 | 2%",
            },
        ])
    })
})
