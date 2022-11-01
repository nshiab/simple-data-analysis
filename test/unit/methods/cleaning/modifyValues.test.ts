import assert from "assert"
import modifyValues from "../../../../src/methods/cleaning/modifyValues.js"

describe("modifyValues", function () {
    it("should modify values", function () {
        const data = [{ key1: 1 }, { key1: 11 }]
        const modifiedData = modifyValues(
            data,
            "key1",
            (value) => (value as number) * 2
        )
        assert.deepEqual(modifiedData, [{ key1: 2 }, { key1: 22 }])
    })

    it("should save modified values with a new key", function () {
        const data = [{ key1: 1 }, { key1: 11 }]
        const modifiedData = modifyValues(
            data,
            "key1",
            (value) => (value as number) * 2,
            "key1x"
        )
        assert.deepEqual(modifiedData, [
            { key1: 1, key1x: 2 },
            { key1: 11, key1x: 22 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1 }, { key1: 11 }]

        assert.throws(() =>
            modifyValues(data, "key1", (value) => (value as number) * 2, "key1")
        )
    })
})
