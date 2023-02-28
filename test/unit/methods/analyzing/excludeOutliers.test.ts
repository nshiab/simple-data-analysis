import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("excludeOutliers", function () {
    it("should exclude outliers", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 222 },
            { key1: 11111, key2: 2222 },
        ]
        const sd = new SimpleData({ data }).excludeOutliers({ key: "key1" })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 222 },
        ])
    })
})
