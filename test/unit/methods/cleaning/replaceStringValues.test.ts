import assert from "assert"
import replaceStringValues from "../../../../src/methods/cleaning/replaceStringValues.js"

describe("replaceStringValues", function () {
    it("should replace values", function () {
        const data = [{ patate: "I am potato", poil: "I am poil" }]
        const replacedValues = replaceStringValues(
            data,
            "patate",
            "I am",
            "You are",
            "partialString"
        )
        assert.deepEqual(replacedValues, [
            { patate: "You are potato", poil: "I am poil" },
        ])
    })
})
