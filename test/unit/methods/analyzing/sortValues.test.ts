import assert from "assert"
import sortValues from "../../../../src/methods/analyzing/sortValues.js"

describe("sortValues", function () {
    it("should sort values", function () {
        const data = [
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
            { patate: 1, poil: 2 },
        ]
        const sortedData = sortValues(data, "patate", "descending")
        assert.deepEqual(sortedData, [
            { patate: 111, poil: 222 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 2 },
        ])
    })
})
