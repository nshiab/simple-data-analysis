import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addVariation", function () {
    it("should add a variation inside a newKey", function () {
        const data = [
            { key1: "yellow", key2: 12 },
            { key1: "red", key2: 1 },
            { key1: "blue", key2: 5 },
            { key1: "pink", key2: 25 },
        ]

        const sd = new SimpleData({ data }).addVariation({
            key: "key2",
            newKey: "key2Variation",
            valueGenerator: (a, b) =>
                typeof a === "number" && typeof b === "number" ? a - b : NaN,
        })

        assert.deepEqual(sd.getData(), [
            { key1: "yellow", key2: 12, key2Variation: undefined },
            { key1: "red", key2: 1, key2Variation: 11 },
            { key1: "blue", key2: 5, key2Variation: -4 },
            { key1: "pink", key2: 25, key2Variation: -20 },
        ])
    })
    it("should sort ascendingly first and then add a variation inside a newKey, with a defined first value", function () {
        const data = [
            { key1: "yellow", key2: 12 },
            { key1: "red", key2: 1 },
            { key1: "blue", key2: 5 },
            { key1: "pink", key2: 25 },
        ]
        const sd = new SimpleData({ data }).addVariation({
            key: "key2",
            newKey: "key2Variation",
            order: "ascending",
            firstValue: 0,
            valueGenerator: (a, b) =>
                typeof a === "number" && typeof b === "number" ? a - b : NaN,
        })

        assert.deepEqual(sd.getData(), [
            { key1: "red", key2: 1, key2Variation: 0 },
            { key1: "blue", key2: 5, key2Variation: -4 },
            { key1: "yellow", key2: 12, key2Variation: -7 },
            { key1: "pink", key2: 25, key2Variation: -13 },
        ])
    })

    it("should sort descendingly first and then add a variation inside a newKey, with a defined first value", function () {
        const data = [
            { key1: "yellow", key2: 12 },
            { key1: "red", key2: 1 },
            { key1: "blue", key2: 5 },
            { key1: "pink", key2: 25 },
        ]
        const sd = new SimpleData({ data }).addVariation({
            key: "key2",
            newKey: "key2Variation",
            order: "descending",
            firstValue: 0,
            valueGenerator: (a, b) =>
                typeof a === "number" && typeof b === "number" ? a - b : NaN,
        })

        assert.deepEqual(sd.getData(), [
            { key1: "pink", key2: 25, key2Variation: 0 },
            { key1: "yellow", key2: 12, key2Variation: 13 },
            { key1: "blue", key2: 5, key2Variation: 7 },
            { key1: "red", key2: 1, key2Variation: 4 },
        ])
    })
})
