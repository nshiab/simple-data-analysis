import assert from "assert"
import filterItems from "../../../../src/methods/selecting/filterItems.js"

describe("filterItems", function () {
    it("should filter items", function () {
        const data = [
            { patate: 0, poil: 2 },
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
            { patate: 2, poil: 6 },
        ]
        const newData = filterItems(data, (item) =>
            item.poil && item.patate ? item.poil < 5 && item.patate >= 1 : false
        )
        assert.deepEqual(newData, [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 4 },
        ])
    })
})
