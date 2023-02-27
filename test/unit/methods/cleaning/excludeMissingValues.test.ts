import assert from "assert"
import excludeMissingValues from "../../../../src/methods/cleaning/excludeMissingValues.js"

describe("excludeMissingValues", function () {
    it("should exclude missing values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const cleanData = excludeMissingValues(data)
        assert.deepEqual(cleanData, [{ key1: 11, key2: 22 }])
    })
    it("should keep missing values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const missingData = excludeMissingValues(
            data,
            undefined,
            undefined,
            undefined,
            true
        )
        assert.deepEqual(missingData, [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
        ])
    })
})
