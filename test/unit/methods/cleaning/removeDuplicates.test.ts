import assert from "assert"
import removeDuplicates from "../../../../src/methods/cleaning/removeDuplicates.js"

describe("removeDuplicates", function () {
    it("should not remove items", function () {
        const data = [
            { patate: 1, poil: 1 },
            { patate: 2, poil: 2 },
            { patate: 3, poil: 3 },
        ]
        const newData = removeDuplicates(data)
        assert.deepEqual(newData, data)
    })

    it("should remove item", function () {
        const data = [
            { patate: 1, poil: 1 },
            { patate: 1, poil: 1 },
            { patate: 2, poil: 2 },
        ]
        const newData = removeDuplicates(data)
        assert.deepEqual(newData, [
            { patate: 1, poil: 1 },
            { patate: 2, poil: 2 },
        ])
    })

    it("should remove item with specific key", function () {
        const data = [
            { id: 0, patate: 1, poil: 1 },
            { id: 1, patate: 2, poil: 2 },
            { id: 1, patate: 3, poil: 3 },
            { id: 2, patate: 4, poil: 4 },
        ]
        const newData = removeDuplicates(data, "id")
        assert.deepEqual(newData, [
            { id: 0, patate: 1, poil: 1 },
            { id: 1, patate: 2, poil: 2 },
            { id: 2, patate: 4, poil: 4 },
        ])
    })

    it("should throw with non existing key", function () {
        const data = [
            { id: 0, patate: 1, poil: 1 },
            { id: 1, patate: 2, poil: 2 },
            { id: 1, patate: 3, poil: 3 },
            { id: 2, patate: 4, poil: 4 },
        ]
        assert.throws(() => removeDuplicates(data, "peanut"))
    })
})
