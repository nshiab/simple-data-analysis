import assert from "assert"
import selectKeys from "../../../../src/methods/selecting/selectKeys.js"

describe("selectKeys", function () {
    it("should select keys", function () {
        const data = [
            { patate: 0, poil: 2, animal: "orignal" },
            { patate: 1, poil: 2, animal: "raton" },
            { patate: 2, poil: 4, animal: "castor" },
            { patate: 2, poil: 6, animal: "chat" },
        ]
        const newData = selectKeys(data, ["patate", "poil"])
        assert.deepEqual(newData, [
            { patate: 0, poil: 2 },
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
            { patate: 2, poil: 6 },
        ])
    })
})
