import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("filterItems", function () {
    it("should filter items", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ]

        const sd = new SimpleData({ data }).filterItems({
            itemComparator: (item) =>
                item.key2 && item.key1
                    ? item.key2 < 5 && item.key1 >= 1
                    : false,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })
})
