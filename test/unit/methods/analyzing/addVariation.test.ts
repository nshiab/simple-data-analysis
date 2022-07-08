import assert from "assert"
import addVariation from "../../../../src/methods/analyzing/addVariation.js"

describe("addVariation", function () {
    it("should add a variation inside a newKey", function () {
        const data = [
            { patate: "yellow", poil: 12 },
            { patate: "red", poil: 1 },
            { patate: "blue", poil: 5 },
            { patate: "pink", poil: 25 },
        ]
        const variationData = addVariation(
            data,
            "poil",
            "poilVariation",
            (a, b) =>
                typeof a === "number" && typeof b === "number" ? a - b : NaN
        )

        assert.deepEqual(variationData, [
            { patate: "yellow", poil: 12, poilVariation: undefined },
            { patate: "red", poil: 1, poilVariation: 11 },
            { patate: "blue", poil: 5, poilVariation: -4 },
            { patate: "pink", poil: 25, poilVariation: -20 },
        ])
    })
    it("should sort ascendingly first and then add a variation inside a newKey, with a defined first value", function () {
        const data = [
            { patate: "yellow", poil: 12 },
            { patate: "red", poil: 1 },
            { patate: "blue", poil: 5 },
            { patate: "pink", poil: 25 },
        ]
        const variationData = addVariation(
            data,
            "poil",
            "poilVariation",
            (a, b) =>
                typeof a === "number" && typeof b === "number" ? a - b : NaN,
            "ascending",
            0
        )

        assert.deepEqual(variationData, [
            { patate: "red", poil: 1, poilVariation: 0 },
            { patate: "blue", poil: 5, poilVariation: -4 },
            { patate: "yellow", poil: 12, poilVariation: -7 },
            { patate: "pink", poil: 25, poilVariation: -13 },
        ])
    })

    it("should sort descendingly first and then add a variation inside a newKey, with a defined first value", function () {
        const data = [
            { patate: "yellow", poil: 12 },
            { patate: "red", poil: 1 },
            { patate: "blue", poil: 5 },
            { patate: "pink", poil: 25 },
        ]
        const variationData = addVariation(
            data,
            "poil",
            "poilVariation",
            (a, b) =>
                typeof a === "number" && typeof b === "number" ? a - b : NaN,
            "descending",
            0
        )

        assert.deepEqual(variationData, [
            { patate: "pink", poil: 25, poilVariation: 0 },
            { patate: "yellow", poil: 12, poilVariation: 13 },
            { patate: "blue", poil: 5, poilVariation: 7 },
            { patate: "red", poil: 1, poilVariation: 4 },
        ])
    })
})
