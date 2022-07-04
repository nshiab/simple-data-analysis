import assert from "assert"
import sortValues from "../../../../src/methods/analyzing/sortValues.js"

describe("sortValues", function () {
    it("should sort number values in an ascending order", function () {
        const data = [
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
            { patate: 1, poil: 2 },
        ]
        const sortedData = sortValues(data, "patate", "ascending")
        assert.deepEqual(sortedData, [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
        ])
    })

    it("should sort number values in a descending order", function () {
        const data = [
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
            { patate: 1, poil: 2 },
        ]
        const sortedData = sortValues(data, "patate", "descending")
        assert.deepEqual(sortedData, [
            { patate: 111, poil: 222 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 2 },
        ])
    })

    it("should sort string values with accents in an ascending order", function () {
        const data = [
            { patate: "Éléphant" },
            { patate: "Autruche" },
            { patate: "Écouter" },
            { patate: "Escrime" },
        ]
        const sortedData = sortValues(data, "patate", "ascending")
        assert.deepEqual(sortedData, [
            { patate: "Autruche" },
            { patate: "Écouter" },
            { patate: "Éléphant" },
            { patate: "Escrime" },
        ])
    })

    it("should sort string values with accents in a descending order", function () {
        const data = [
            { patate: "Autruche" },
            { patate: "Éléphant" },
            { patate: "À la claire fontaine" },
            { patate: "Écouter" },
            { patate: "Escrime" },
            { patate: "Amoureux" },
            { patate: "Écoutant les oiseaux" },
            { patate: "Autruche" },
        ]
        const sortedData = sortValues(data, "patate", "descending")
        assert.deepEqual(sortedData, [
            { patate: "Escrime" },
            { patate: "Éléphant" },
            { patate: "Écouter" },
            { patate: "Écoutant les oiseaux" },
            { patate: "Autruche" },
            { patate: "Autruche" },
            { patate: "Amoureux" },
            { patate: "À la claire fontaine" },
        ])
    })
})
