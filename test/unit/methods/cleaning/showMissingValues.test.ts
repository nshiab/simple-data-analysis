import assert from "assert"
import showMissingValues from "../../../../src/methods/cleaning/showMissingValues.js"

describe("showMissingValues", function () {
    it("should show missing values", function () {
        const data = [
            { patate: null, poil: 2 },
            { patate: 3, poil: NaN },
            { patate: "", poil: 5 },
            { patate: undefined, poil: 4 },
            { patate: 11, poil: 22 },
        ]

        const missingData = showMissingValues(data)
        assert.deepEqual(missingData, [
            { patate: null, poil: 2 },
            { patate: 3, poil: NaN },
            { patate: "", poil: 5 },
            { patate: undefined, poil: 4 },
        ])
    })
})
