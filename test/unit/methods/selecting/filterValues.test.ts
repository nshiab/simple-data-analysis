import assert from "assert"
import filterValues from "../../../../src/methods/selecting/filterValues.js"

describe("filterValues", function () {
    it("should filter values", function () {
        const data = [
            { patate: 0, poil: 2 },
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
            { patate: 2, poil: 6 },
        ]
        const newData = filterValues(data, "poil", (value) =>
            value ? value < 5 : false
        )
        assert.deepEqual(newData, [
            { patate: 0, poil: 2 },
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
        ])
    })
})
