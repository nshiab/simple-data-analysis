import assert from "assert"
import removeKey from "../../../../src/methods/restructuring/removeKey.js"

describe("removeKey", function () {
    it("should remove a key", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]
        const newData = removeKey(data, "key2")
        assert.deepEqual(newData, [{ key1: 1 }, { key1: 2 }])
    })
})
