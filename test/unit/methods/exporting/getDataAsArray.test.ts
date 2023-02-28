import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("getDataAsArrays", function () {
    it("should return the data as arrays", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        assert.deepEqual(new SimpleData({ data }).getDataAsArrays(), {
            key1: [1, 11, 111],
            key2: [2, 22, 222],
        })
    })
})
