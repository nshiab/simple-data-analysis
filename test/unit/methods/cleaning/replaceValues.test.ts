import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("replaceValues", function () {
    it("should replace partial string values", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]
        const sd = new SimpleData({ data }).replaceValues({
            key: "key1",
            oldValue: "I am",
            newValue: "You are",
            method: "partialString",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "You are potato", key2: "I am key2" },
        ])
    })

    it("should replace entire string values", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]
        const sd = new SimpleData({ data }).replaceValues({
            key: "key1",
            oldValue: "I am potato",
            newValue: "You are potato",
            method: "entireString",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "You are potato", key2: "I am key2" },
        ])
    })

    it("should replace any kind of values", function () {
        const data = [
            { key1: 12, key2: "I am key2" },
            { key1: 45, key2: "I am key2" },
        ]

        const sd = new SimpleData({ data }).replaceValues({
            key: "key1",
            oldValue: 12,
            newValue: 25,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 25, key2: "I am key2" },
            { key1: 45, key2: "I am key2" },
        ])
    })

    it("should replace string values and skip errors", function () {
        const data = [
            { key1: "I am potato", key2: "I am key2" },
            { key1: 32, key2: "I am key2" },
        ]
        const sd = new SimpleData({ data }).replaceValues({
            key: "key1",
            oldValue: "I am",
            newValue: "You are",
            method: "partialString",
            skipErrors: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "You are potato", key2: "I am key2" },
            { key1: 32, key2: "I am key2" },
        ])
    })

    it("should save replaced partial string values with a new key", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]

        const sd = new SimpleData({ data }).replaceValues({
            key: "key1",
            newKey: "key1x",
            oldValue: "I am",
            newValue: "You are",
            method: "partialString",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "I am potato", key1x: "You are potato", key2: "I am key2" },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]

        assert.throws(() =>
            new SimpleData({ data }).replaceValues({
                key: "key1",
                newKey: "key2",
                oldValue: "I am",
                newValue: "You are",
                method: "partialString",
            })
        )
    })
})
