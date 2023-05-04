import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("valuesToFloat", function () {
    it("should convert values to float", function () {
        const data = [{ key1: "1,000,000.5", key2: 2 }]
        const sd = new SimpleData({ data }).valuesToFloat({ key: "key1" })
        assert.deepStrictEqual(sd.getData(), [{ key1: 1000000.5, key2: 2 }])
    })

    it("should convert French formatted numbers to float", function () {
        const data = [{ key1: "1 000 000,5", key2: 2 }]
        const sd = new SimpleData({ data }).valuesToFloat({
            key: "key1",
            thousandSeparator: " ",
            decimalSeparator: ",",
        })
        assert.deepStrictEqual(sd.getData(), [{ key1: 1000000.5, key2: 2 }])
    })

    it("should not throw errors when floats are already here", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "1,000,000.75", key2: 2 },
        ]
        const sd = new SimpleData({ data }).valuesToFloat({
            key: "key1",
            thousandSeparator: ",",
            decimalSeparator: ".",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: 1000000.75, key2: 2 },
        ])
    })

    it("should skip errors", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "a", key2: 2 },
        ]
        const sd = new SimpleData({ data }).valuesToFloat({
            key: "key1",
            thousandSeparator: ",",
            decimalSeparator: ".",
            skipErrors: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "a", key2: 2 },
        ])
    })

    it("should save values as floats with a new key", function () {
        const data = [{ key1: "1,000,000.5", key2: 2 }]

        const sd = new SimpleData({ data }).valuesToFloat({
            key: "key1",
            newKey: "key1x",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1,000,000.5", key2: 2, key1x: 1000000.5 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "1,000,000.75", key2: 2 },
        ]
        assert.throws(() =>
            new SimpleData({ data }).valuesToFloat({
                key: "key1",
                newKey: "key2",
            })
        )
    })
})
