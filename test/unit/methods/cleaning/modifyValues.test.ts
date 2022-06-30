import assert from "assert"
import modifyValues from "../../../../src/methods/cleaning/modifyValues.js"

describe("modifyValues", function () {
    it("should modify values", function () {
        const data = [{ patate: 1 }, { patate: 11 }]
        const modifiedData = modifyValues(
            data,
            "patate",
            (value) => (value as number) * 2
        )
        assert.deepEqual(modifiedData, [{ patate: 2 }, { patate: 22 }])
    })
})
