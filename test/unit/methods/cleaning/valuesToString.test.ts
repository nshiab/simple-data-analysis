import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("valuesToString", function () {
    it("should convert values to string", function () {
        const data = [{ key1: 1, key2: 2 }]
        const sd = new SimpleData({ data }).valuesToString({ key: "key1" })
        assert.deepStrictEqual(sd.getData(), [{ key1: "1", key2: 2 }])
    })

    it("should save values as strings with a new key", function () {
        const data = [{ key1: 1, key2: 2 }]
        const sd = new SimpleData({ data }).valuesToString({
            key: "key1",
            newKey: "key1x",
        })
        assert.deepStrictEqual(sd.getData(), [{ key1: 1, key1x: "1", key2: 2 }])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1, key2: 2 }]
        assert.throws(() =>
            new SimpleData({ data }).valuesToString({
                key: "key1",
                newKey: "key2",
            })
        )
    })
})
