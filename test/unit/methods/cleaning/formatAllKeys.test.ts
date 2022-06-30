import assert from "assert"
import formatAllKeys from "../../../../src/methods/cleaning/formatAllKeys.js"

describe("formatAllKeys", function () {
    it("should format keys", function () {
        const data = [
            { patate_poil_1: 1, "patate poil 2": 2, "PATATE-POIL#3": 3 },
        ]
        const formatedData = formatAllKeys(data)
        assert.deepEqual(formatedData, [
            { patatePoil1: 1, patatePoil2: 2, patatePoil3: 3 },
        ])
    })
})
