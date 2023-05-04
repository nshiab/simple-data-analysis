import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("datesToString", function () {
    it("should convert date to string", function () {
        const data = [{ key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 }]
        const sd = new SimpleData({ data }).datesToString({
            key: "key1",
            format: "%Y-%m-%d",
        })
        assert.deepStrictEqual(sd.getData(), [{ key1: "2022-02-03", key2: 2 }])
    })

    it("should convert date to string and skip errors", function () {
        const data = [
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
            { key1: 12, key2: 2 },
        ]
        const sd = new SimpleData({ data }).datesToString({
            key: "key1",
            format: "%Y-%m-%d",
            skipErrors: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "2022-02-03", key2: 2 },
            { key1: 12, key2: 2 },
        ])
    })

    it("should save dates as strings with a new key", function () {
        const data = [{ key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 }]
        const sd = new SimpleData({ data }).datesToString({
            key: "key1",
            newKey: "key1x",
            format: "%Y-%m-%d",
        })
        assert.deepStrictEqual(sd.getData(), [
            {
                key1: new Date(Date.UTC(2022, 1, 3)),
                key2: 2,
                key1x: "2022-02-03",
            },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 }]
        assert.throws(() =>
            new SimpleData({ data }).datesToString({
                key: "key1",
                newKey: "key2",
                format: "%Y-%m-%d",
            })
        )
    })
})
