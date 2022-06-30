import assert from "assert"
import modifyItems from "../../../../src/methods/restructuring/modifyItems.js"

describe("modifyItems", function () {
    it("should modify items", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
        ]
        const newData = modifyItems(data, "patate", (item) =>
            item.patate && item.poil
                ? (item.patate as number) * (item.poil as number)
                : undefined
        )
        assert.deepEqual(newData, [
            { patate: 2, poil: 2 },
            { patate: 8, poil: 4 },
        ])
    })
})
