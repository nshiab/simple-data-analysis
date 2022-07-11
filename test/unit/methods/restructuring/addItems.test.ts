import assert from "assert"
import SimpleData from "../../../../src/class/SimpleData.js"
import addItems from "../../../../src/methods/restructuring/addItems.js"

describe("addItems", function () {
    it("should add items as array of objects", function () {
        const data = [{ key1: 1 }]
        const dataToBeAdded = [{ key1: 2 }]
        const newData = addItems(data, dataToBeAdded)

        assert.deepEqual(newData, [{ key1: 1 }, { key1: 2 }])
    })

    it("should add items as a SimpleData instance", function () {
        const data = [{ key1: 1 }]
        const dataToBeAdded = new SimpleData({ data: [{ key1: 2 }] })
        const newData = addItems(data, dataToBeAdded)

        assert.deepEqual(newData, [{ key1: 1 }, { key1: 2 }])
    })

    it("should add items if missing keys and fillMissingKeys is true", function () {
        const data = [{ key1: 1, key2: 2 }]
        const dataToBeAdded = [{ key1: 2 }]
        const newData = addItems(data, dataToBeAdded, true)

        assert.deepEqual(newData, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: undefined },
        ])
    })

    it("should throw error if missing keys and fillMissingKeys is false", function () {
        const data = [{ key1: 1, key2: 2 }]
        const dataToBeAdded = [{ key1: 2 }]
        assert.throws(() => addItems(data, dataToBeAdded, false))
    })

    it("should throw error if dataToBeAdded has extra keys", function () {
        const data = [{ key1: 1 }]
        const dataToBeAdded = [{ key1: 2, key2: 2 }]
        assert.throws(() => addItems(data, dataToBeAdded, true))
    })
})
