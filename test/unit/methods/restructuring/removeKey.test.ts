import assert from "assert"
import removeKey from "../../../../src/methods/restructuring/removeKey.js"

describe("removeKey", function () {
    it("should remove a key", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
        ]
        const newData = removeKey(data, "poil")
        assert.deepEqual(newData, [{ patate: 1 }, { patate: 2 }])
    })
})
