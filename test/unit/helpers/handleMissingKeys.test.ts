import assert from "assert"
import handleMissingKeys from "../../../src/helpers/handleMissingKeys.js"

describe("handleMissingKeys", function () {
    it("should do nothing if data is empty", function () {
        const data = handleMissingKeys([], false)
        assert.equal(data.length, 0)
    })

    it("should not throw error if fillMissingKeys is false and no missing keys", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 3 },
        ]
        const newData = handleMissingKeys(data, false)
        assert.equal(data, newData)
    })

    it("should throw error if fillMissingKeys is false and missing keys", function () {
        const data = [{ patate: 1, poil: 2 }, { patate: 2 }]
        assert.throws(() => handleMissingKeys(data, false))
    })

    it("should fill missing keys", function () {
        const data = [{ patate: 1, poil: 2 }, { patate: 2 }]
        const newData = handleMissingKeys(data, true)
        assert.deepEqual(newData, [
            { patate: 1, poil: 2 },
            { patate: 2, poil: undefined },
        ])
    })

    it("should fill missing keys if first item is not complete", function () {
        const data = [{ patate: 2 }, { patate: 1, poil: 2 }]
        const newData = handleMissingKeys(data, true)
        assert.deepEqual(newData, [
            { patate: 2, poil: undefined },
            { patate: 1, poil: 2 },
        ])
    })

    it("should fill missing keys with unique keys", function () {
        const data = [{ patate: 2 }, { patate: 1, poil: 2 }]
        const newData = handleMissingKeys(data, true, [
            "patate",
            "poil",
            "peanut",
        ])
        assert.deepEqual(newData, [
            { patate: 2, poil: undefined, peanut: undefined },
            { patate: 1, poil: 2, peanut: undefined },
        ])
    })
})
