import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("filterValues", function () {
    it("should filter values", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ]
        const sd = new SimpleData({ data }).filterValues({
            key: "key2",
            valueComparator: (value) => (value ? value < 5 : false),
        })
        assert.deepEqual(sd.getData(), [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })
})
