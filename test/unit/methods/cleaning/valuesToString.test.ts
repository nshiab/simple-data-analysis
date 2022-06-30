import assert from "assert"
import valuesToString from "../../../../src/methods/cleaning/valuesToString.js"

describe("valuesToString", function () {
    it("should convert values to string", function () {
        const data = [{ patate: 1, poil: 2 }]
        const stringifiedData = valuesToString(data, "patate")
        assert.deepEqual(stringifiedData, [{ patate: "1", poil: 2 }])
    })
})
