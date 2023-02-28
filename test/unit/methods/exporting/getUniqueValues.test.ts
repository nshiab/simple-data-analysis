import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("getUniqueValues", function () {
    it("should return unique values", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        assert.deepEqual(
            new SimpleData({ data }).getUniqueValues({ key: "key1" }),
            [1, 111]
        )
    })
})
