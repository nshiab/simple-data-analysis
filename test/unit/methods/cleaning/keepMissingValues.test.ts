import assert from "assert"
import keepMissingValues from "../../../../src/methods/cleaning/keepMissingValues.js"

describe("keepMissingValues", function () {
    it("should keep missing values", function () {
        const data = [
            { patate: null, poil: 2 },
            { patate: 3, poil: NaN },
            { patate: "", poil: 5 },
            { patate: undefined, poil: 4 },
            { patate: 11, poil: 22 },
        ]

        const missingData = keepMissingValues(data)
        assert.deepEqual(missingData, [
            { patate: null, poil: 2 },
            { patate: 3, poil: NaN },
            { patate: "", poil: 5 },
            { patate: undefined, poil: 4 },
        ])
    })
})
