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
                typeof item.key2 === "number" && typeof item.key1 === "number"
                    ? item.key2 < 5 && item.key1 >= 1
                    : false,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })
})
