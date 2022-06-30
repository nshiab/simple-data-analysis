import assert from "assert"
import addKey from "../../../../src/methods/restructuring/addKey.js"

describe("addItems", function () {
    it("should add a new key and generate new values", function () {
        const data = [{ patate: 1 }, { patate: 2 }]
        const newData = addKey(
            data,
            "poil",
            (item) => (item.patate as number) * 2
        )
        assert.deepEqual(newData, [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
        ])
    })
})
