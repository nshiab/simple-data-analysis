import assert from "assert"
import valuesToFloat from "../../../../src/methods/cleaning/valuesToFloat.js"

describe("valuesToFloat", function () {
    it("should convert values to float", function () {
        const data = [{ patate: "1,000,000.5", poil: 2 }]
        const floatsData = valuesToFloat(data, "patate")
        assert.deepEqual(floatsData, [{ patate: 1000000.5, poil: 2 }])
    })

    it("should convert French formatted numbers to float", function () {
        const data = [{ patate: "1 000 000,5", poil: 2 }]
        const floatsData = valuesToFloat(data, "patate", "fr")
        assert.deepEqual(floatsData, [{ patate: 1000000.5, poil: 2 }])
    })
})
