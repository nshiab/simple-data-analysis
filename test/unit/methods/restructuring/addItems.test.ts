import assert from "assert"
import SimpleData from "../../../../src/class/SimpleData.js"
import addItems from "../../../../src/methods/restructuring/addItems.js"

describe("addItems", function () {
    it("should add items as array of objects", function () {
        const data = [{ patate: 1 }]
        const dataToBeAdded = [{ patate: 2 }]
        const newData = addItems(data, dataToBeAdded)

        assert.deepEqual(newData, [{ patate: 1 }, { patate: 2 }])
    })

    it("should add items as a SimpleData instance", function () {
        const data = [{ patate: 1 }]
        const dataToBeAdded = new SimpleData({ data: [{ patate: 2 }] })
        const newData = addItems(data, dataToBeAdded)

        assert.deepEqual(newData, [{ patate: 1 }, { patate: 2 }])
    })

    it("should add items if missing keys and fillMissingKeys is true", function () {
        const data = [{ patate: 1, poil: 2 }]
        const dataToBeAdded = [{ patate: 2 }]
        const newData = addItems(data, dataToBeAdded, true)

        assert.deepEqual(newData, [
            { patate: 1, poil: 2 },
            { patate: 2, poil: undefined },
        ])
    })

    it("should throw error if missing keys and fillMissingKeys is false", function () {
        const data = [{ patate: 1, poil: 2 }]
        const dataToBeAdded = [{ patate: 2 }]
        assert.throws(() => addItems(data, dataToBeAdded, false))
    })

    it("should throw error if dataToBeAdded has extra keys", function () {
        const data = [{ patate: 1 }]
        const dataToBeAdded = [{ patate: 2, poil: 2 }]
        assert.throws(() => addItems(data, dataToBeAdded, true))
    })
})
