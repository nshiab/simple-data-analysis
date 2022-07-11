import assert from "assert"
import renameKey from "../../../../src/methods/cleaning/renameKey.js"

describe("renameKey", function () {
    it("should rename key", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
        ]
        const renamedKeys = renameKey(data, "key1", "navet")
        assert.deepEqual(renamedKeys, [
            { navet: 1, key2: 2 },
            { navet: 11, key2: 22 },
        ])
    })
})
