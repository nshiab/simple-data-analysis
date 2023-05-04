import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("valuesToDate", function () {
    it("should convert values to date", function () {
        const data = [{ key1: "2022-02-03", key2: 2 }]
        const sd = new SimpleData({ data }).valuesToDate({
            key: "key1",
            format: "%Y-%m-%d",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
        ])
    })
    it("should convert values to date and not throw errors when Dates are present", function () {
        const data = [
            { key1: "2022-02-03", key2: 2 },
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
        ]
        const sd = new SimpleData({ data }).valuesToDate({
            key: "key1",
            format: "%Y-%m-%d",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
        ])
    })
    it("should convert values to date and skip errors", function () {
        const data = [
            { key1: "2022-02-03", key2: 2 },
            { key1: NaN, key2: 2 },
            { key1: "coucou", key2: 2 },
            { key1: 35, key2: 2 },
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
        ]
        const sd = new SimpleData({ data }).valuesToDate({
            key: "key1",
            format: "%Y-%m-%d",
            skipErrors: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
            { key1: NaN, key2: 2 },
            { key1: "coucou", key2: 2 },
            { key1: 35, key2: 2 },
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
        ])
    })

    it("should save values as dates with a new key", function () {
        const data = [
            { key1: "2022-02-03", key2: 2 },
            { key1: NaN, key2: 2 },
            { key1: "coucou", key2: 2 },
            { key1: 35, key2: 2 },
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
        ]
        const sd = new SimpleData({ data }).valuesToDate({
            key: "key1",
            newKey: "key1x",
            format: "%Y-%m-%d",
            skipErrors: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            {
                key1: "2022-02-03",
                key1x: new Date(Date.UTC(2022, 1, 3)),
                key2: 2,
            },
            { key1: NaN, key1x: NaN, key2: 2 },
            { key1: "coucou", key1x: "coucou", key2: 2 },
            { key1: 35, key1x: 35, key2: 2 },
            {
                key1: new Date(Date.UTC(2022, 1, 3)),
                key1x: new Date(Date.UTC(2022, 1, 3)),
                key2: 2,
            },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: "2022-02-03", key2: 2 }]

        assert.throws(() =>
            new SimpleData({ data }).valuesToDate({
                key: "key1",
                format: "%y-%m-%d",
                newKey: "key2",
            })
        )
    })
})
