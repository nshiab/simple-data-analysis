import assert from "assert"
import getDataAsArrays from "../../../../src/methods/exporting/getDataAsArrays.js"

describe("getDataAsArrays", function () {
    it("should return the data as arrays", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const arrays = getDataAsArrays(data)
        assert.deepEqual(arrays, { patate: [1, 11, 111], poil: [2, 22, 222] })
    })
})
