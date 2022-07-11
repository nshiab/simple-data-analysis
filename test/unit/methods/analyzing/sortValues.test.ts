import assert from "assert"
import sortValues from "../../../../src/methods/analyzing/sortValues.js"

describe("sortValues", function () {
    it("should sort number values in an ascending order", function () {
        const data = [
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
            { key1: 1, key2: 2 },
        ]
        const sortedData = sortValues(data, "key1", "ascending")
        assert.deepEqual(sortedData, [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ])
    })

    it("should sort number values in a descending order", function () {
        const data = [
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
            { key1: 1, key2: 2 },
        ]
        const sortedData = sortValues(data, "key1", "descending")
        assert.deepEqual(sortedData, [
            { key1: 111, key2: 222 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 2 },
        ])
    })

    it("should sort string values with accents in an ascending order", function () {
        const data = [
            { key1: "Éléphant" },
            { key1: "Autruche" },
            { key1: "Écouter" },
            { key1: "Escrime" },
        ]
        const sortedData = sortValues(data, "key1", "ascending")
        assert.deepEqual(sortedData, [
            { key1: "Autruche" },
            { key1: "Écouter" },
            { key1: "Éléphant" },
            { key1: "Escrime" },
        ])
    })

    it("should sort string values with accents in a descending order", function () {
        const data = [
            { key1: "Autruche" },
            { key1: "Éléphant" },
            { key1: "À la claire fontaine" },
            { key1: "Écouter" },
            { key1: "Escrime" },
            { key1: "Amoureux" },
            { key1: "Écoutant les oiseaux" },
            { key1: "Autruche" },
        ]
        const sortedData = sortValues(data, "key1", "descending")
        assert.deepEqual(sortedData, [
            { key1: "Escrime" },
            { key1: "Éléphant" },
            { key1: "Écouter" },
            { key1: "Écoutant les oiseaux" },
            { key1: "Autruche" },
            { key1: "Autruche" },
            { key1: "Amoureux" },
            { key1: "À la claire fontaine" },
        ])
    })
})
