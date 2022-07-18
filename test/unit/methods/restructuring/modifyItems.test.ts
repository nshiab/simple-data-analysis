import assert from "assert"
import modifyItems from "../../../../src/methods/cleaning/modifyItems.js"

describe("modifyItems", function () {
    it("should modify items", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]
        const newData = modifyItems(data, "key1", (item) =>
            item.key1 && item.key2
                ? (item.key1 as number) * (item.key2 as number)
                : undefined
        )
        assert.deepEqual(newData, [
            { key1: 2, key2: 2 },
            { key1: 8, key2: 4 },
        ])
    })
})
