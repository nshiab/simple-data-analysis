import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("getDataAsCSV", function () {
    it("should return the data as a CSV string", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]

        assert.deepStrictEqual(
            new SimpleData({ data }).getDataAsCSV(),
            `key1,key2
1,2
11,22
111,222`
        )
    })
})
