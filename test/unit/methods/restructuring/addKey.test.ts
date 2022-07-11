import assert from "assert"
import addKey from "../../../../src/methods/restructuring/addKey.js"

describe("addItems", function () {
    it("should add a new key and generate new values", function () {
        const data = [{ key1: 1 }, { key1: 2 }]
        const newData = addKey(
            data,
            "key2",
            (item) => (item.key1 as number) * 2
        )
        assert.deepEqual(newData, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })
})
