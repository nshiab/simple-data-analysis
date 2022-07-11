import assert from "assert"
import getItem from "../../../../src/methods/exporting/getItem.js"

describe("getItem", function () {
    it("should return a specific item", function () {
        const data = [
            { key1: "red", key3: "caribou", key2: 2 },
            { key1: "red", key3: "castor", key2: 22 },
            { key1: "blue", key3: "castor", key2: 222 },
        ]
        const item = getItem(data, { key1: "red", key3: "castor" })
        assert.deepEqual(item, { key1: "red", key3: "castor", key2: 22 })
    })
})
