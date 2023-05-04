import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("modifyValues", function () {
    it("should modify values", function () {
        const data = [{ key1: 1 }, { key1: 11 }]

        const sd = new SimpleData({ data }).modifyValues({
            key: "key1",
            valueGenerator: (val) => (val as number) * 2,
        })
        assert.deepStrictEqual(sd.getData(), [{ key1: 2 }, { key1: 22 }])
    })

    it("should save modified values with a new key", function () {
        const data = [{ key1: 1 }, { key1: 11 }]
        const sd = new SimpleData({ data }).modifyValues({
            key: "key1",
            newKey: "key1x",
            valueGenerator: (val) => (val as number) * 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key1x: 2 },
            { key1: 11, key1x: 22 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1 }, { key1: 11 }]

        assert.throws(() =>
            new SimpleData({ data }).modifyValues({
                key: "key1",
                newKey: "key1",
                valueGenerator: (val) => (val as number) * 2,
            })
        )
    })
})
