import assert from "assert"
import roundValues from "../../../../src/methods/cleaning/roundValues.js"

describe("roundValues", function () {
    it("should round values", function () {
        const data = [
            { patate: 1.1111, poil: 2 },
            { patate: 11.6666, poil: 22 },
        ]
        const roundedData = roundValues(data, "patate", 2)
        assert.deepEqual(roundedData, [
            { patate: 1.11, poil: 2 },
            { patate: 11.67, poil: 22 },
        ])
    })
})
