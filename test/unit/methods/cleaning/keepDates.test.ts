import assert from "assert"
import keepDates from "../../../../src/methods/cleaning/keepDates.js"

describe("keepDates", function () {
    it("should keep only valid Dates", function () {
        const validDate = new Date()

        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: validDate, key2: 22 },
            { key1: new Date("x"), key2: 22 },
        ]

        const cleanData = keepDates(data, "key1")

        assert.deepEqual(cleanData, [{ key1: validDate, key2: 22 }])
    })
    it("should keep only non Dates and invalid Dates", function () {
        const inValidDate = new Date("x")

        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: new Date(), key2: 22 },
            { key1: inValidDate, key2: 22 },
        ]

        const cleanData = keepDates(data, "key1", true)
        console.log(cleanData)

        assert.deepEqual(cleanData, [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: inValidDate, key2: 22 },
        ])
    })
})
