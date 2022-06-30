import assert from "assert"
import datesToString from "../../../../src/methods/cleaning/datesToString.js"

describe("datesToString", function () {
    it("should convert date to string", function () {
        const data = [{ patate: new Date(Date.UTC(2022, 1, 3)), poil: 2 }]
        const dataParsed = datesToString(data, "patate", "%Y-%m-%d")
        assert.deepEqual(dataParsed, [{ patate: "2022-02-03", poil: 2 }])
    })
})
