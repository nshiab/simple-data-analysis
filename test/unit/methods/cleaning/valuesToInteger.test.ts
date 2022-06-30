import assert from "assert"
import valuesToInteger from "../../../../src/methods/cleaning/valuesToInteger.js"

describe("valuesToInteger", function () {
    it("should convert values to integer", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "2.2", poil: 2 },
            { patate: "100,000,000", poil: 2 },
        ]
        const intergerValues = valuesToInteger(data, "patate")
        assert.deepEqual(intergerValues, [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 2 },
            { patate: 100000000, poil: 2 },
        ])
    })

    it("should convert French formatted numbers to integers", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "2,2", poil: 2 },
            { patate: "100 000 000", poil: 2 },
        ]
        const intergerValues = valuesToInteger(data, "patate", "fr")
        assert.deepEqual(intergerValues, [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 2 },
            { patate: 100000000, poil: 2 },
        ])
    })
})
