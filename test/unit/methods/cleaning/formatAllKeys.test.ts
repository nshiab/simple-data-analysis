import assert from "assert"
import formatAllKeys from "../../../../src/methods/cleaning/formatAllKeys.js"

describe("formatAllKeys", function () {
    it("should format keys", function () {
        const data = [{ key1_key2_1: 1, "key1 key2 2": 2, "key1-key2#3": 3 }]
        const formatedData = formatAllKeys(data)
        assert.deepEqual(formatedData, [
            { key1key21: 1, key1key22: 2, key1key23: 3 },
        ])
    })
})
