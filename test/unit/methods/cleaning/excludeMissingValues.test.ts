import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("excludeMissingValues", function () {
    it("should exclude missing values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const sd = new SimpleData({ data }).excludeMissingValues()
        assert.deepEqual(sd.getData(), [{ key1: 11, key2: 22 }])
    })
    it("should keep missing values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const sd = new SimpleData({ data }).excludeMissingValues({
            keepExcludedOnly: true,
        })
        assert.deepEqual(sd.getData(), [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
        ])
    })
})
