import assert from "assert"
import renameKey from "../../../../src/methods/cleaning/renameKey.js"

describe("renameKey", function () {
    it("should rename key", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const renamedKeys = renameKey(data, "patate", "navet")
        assert.deepEqual(renamedKeys, [
            { navet: 1, poil: 2 },
            { navet: 11, poil: 22 },
        ])
    })
})
