import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("getItem", function () {
    it("should return a specific item", function () {
        const data = [
            { key1: "red", key3: "caribou", key2: 2 },
            { key1: "red", key3: "castor", key2: 22 },
            { key1: "blue", key3: "castor", key2: 222 },
        ]
        assert.deepStrictEqual(
            new SimpleData({ data }).getItem({
                conditions: { key1: "red", key3: "castor" },
            }),
            { key1: "red", key3: "castor", key2: 22 }
        )
    })
})
