import assert from "assert"
import replaceValues from "../../../../src/methods/cleaning/replaceValues.js"

describe("replaceStringValues", function () {
    it("should replace partial string values", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]
        const replacedValues = replaceValues(
            data,
            "key1",
            "I am",
            "You are",
            "partialString"
        )
        assert.deepEqual(replacedValues, [
            { key1: "You are potato", key2: "I am key2" },
        ])
    })

    it("should replace entire string values", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]
        const replacedValues = replaceValues(
            data,
            "key1",
            "I am potato",
            "You are potato",
            "entireString"
        )
        assert.deepEqual(replacedValues, [
            { key1: "You are potato", key2: "I am key2" },
        ])
    })

    it("should replace any kind of values", function () {
        const data = [
            { key1: 12, key2: "I am key2" },
            { key1: 45, key2: "I am key2" },
        ]
        const replacedValues = replaceValues(data, "key1", 12, 25)
        assert.deepEqual(replacedValues, [
            { key1: 25, key2: "I am key2" },
            { key1: 45, key2: "I am key2" },
        ])
    })

    it("should replace string values and skip errors", function () {
        const data = [
            { key1: "I am potato", key2: "I am key2" },
            { key1: 32, key2: "I am key2" },
        ]
        const replacedValues = replaceValues(
            data,
            "key1",
            "I am",
            "You are",
            "partialString",
            true
        )
        assert.deepEqual(replacedValues, [
            { key1: "You are potato", key2: "I am key2" },
            { key1: 32, key2: "I am key2" },
        ])
    })
})
