import assert from "assert"
import keepDuplicates from "../../../../src/methods/cleaning/keepDuplicates.js"

describe("keepDuplicates", function () {
    it("should return empty", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
            { key1: 3, key2: 3 },
        ]
        const newData = keepDuplicates(data)
        assert.deepEqual(newData, [])
    })

    it("should keep duplicated item", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ]
        const newData = keepDuplicates(data)
        assert.deepEqual(newData, [
            { key1: 1, key2: 1 },
            { key1: 1, key2: 1 },
        ])
    })

    it("should keep duplicates for a specific key", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ]
        const newData = keepDuplicates(data, "id")
        assert.deepEqual(newData, [
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
        ])
    })

    it("should throw with non existing key", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ]
        assert.throws(() => keepDuplicates(data, "peanut"))
    })
})
