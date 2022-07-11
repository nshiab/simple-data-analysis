import assert from "assert"
import replaceStringValues from "../../../../src/methods/cleaning/replaceStringValues.js"

describe("replaceStringValues", function () {
    it("should replace string values", function () {
        const data = [{ key1: "I am potato", key2: "I am key2" }]
        const replacedValues = replaceStringValues(
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
})
