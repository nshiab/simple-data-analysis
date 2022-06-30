import assert from "assert"
import valuesToDate from "../../../../src/methods/cleaning/valuesToDate.js"

describe("valuesToDate", function () {
    it("should convert values to date", function () {
        const data = [{ patate: "2022-02-03", poil: 2 }]
        const datesData = valuesToDate(data, "patate", "%Y-%m-%d")
        assert.deepEqual(datesData, [
            { patate: new Date(Date.UTC(2022, 1, 3)), poil: 2 },
        ])
    })
})
