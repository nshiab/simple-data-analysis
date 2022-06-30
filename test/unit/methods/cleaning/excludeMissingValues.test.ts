import assert from "assert"
import excludeMissingValues from "../../../../src/methods/cleaning/excludeMissingValues.js"

describe("excludeMissingValues", function () {
    it("should exclude missing values", function () {
        const data = [
            { patate: null, poil: 2 },
            { patate: NaN, poil: 3 },
            { patate: undefined, poil: 4 },
            { patate: "", poil: 5 },
            { patate: 11, poil: 22 },
        ]

        const cleanData = excludeMissingValues(data)
        assert.deepEqual(cleanData, [{ patate: 11, poil: 22 }])
    })
})
