import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("getArray", function () {
    it("should return an array", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        assert.deepStrictEqual(
            new SimpleData({ data }).getArray({ key: "key1" }),
            [1, 11, 111]
        )
    })
    it("should return an array with multiple keys", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        assert.deepStrictEqual(
            new SimpleData({ data }).getArray({ key: ["key1", "key2"] }),
            [1, 2, 11, 22, 111, 222]
        )
    })
})
