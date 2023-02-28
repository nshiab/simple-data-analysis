import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("sortValues", function () {
    it("should sort number values in an ascending order", function () {
        const data = [
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
            { key1: 1, key2: 2 },
        ]
        const sd = new SimpleData({ data }).sortValues({
            key: "key1",
            order: "ascending",
        })
        assert.deepEqual(sd.getData(), [
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
        const sd = new SimpleData({ data }).sortValues({
            key: "key1",
            order: "descending",
        })
        assert.deepEqual(sd.getData(), [
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
        const sd = new SimpleData({ data }).sortValues({
            key: "key1",
            order: "ascending",
            locale: "fr",
        })
        assert.deepEqual(sd.getData(), [
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
        const sd = new SimpleData({ data }).sortValues({
            key: "key1",
            order: "descending",
            locale: "fr",
        })
        assert.deepEqual(sd.getData(), [
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

    it("should sort values for multiple keys in an ascending order", function () {
        const data = [
            { key1: 1, key2: "c", key3: 1 },
            { key1: 1, key2: "a", key3: 2 },
            { key1: 1, key2: "a", key3: 3 },
            { key1: 1, key2: "c", key3: 4 },
            { key1: 2, key2: "a", key3: 5 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "b", key3: 3 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "c", key3: 7 },
            { key1: 3, key2: "a", key3: 8 },
            { key1: 3, key2: "b", key3: 9 },
            { key1: 3, key2: "b", key3: 0 },
            { key1: 3, key2: "b", key3: -3 },
        ]

        const sd = new SimpleData({ data }).sortValues({
            key: ["key1", "key2", "key3"],
            order: "ascending",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: "a", key3: 2 },
            { key1: 1, key2: "a", key3: 3 },
            { key1: 1, key2: "c", key3: 1 },
            { key1: 1, key2: "c", key3: 4 },
            { key1: 2, key2: "a", key3: 5 },
            { key1: 2, key2: "b", key3: 3 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "c", key3: 7 },
            { key1: 3, key2: "a", key3: 8 },
            { key1: 3, key2: "b", key3: -3 },
            { key1: 3, key2: "b", key3: 0 },
            { key1: 3, key2: "b", key3: 9 },
        ])
    })

    it("should sort values for multiple keys in a descending order", function () {
        const data = [
            { key1: 1, key2: "c", key3: 1 },
            { key1: 1, key2: "a", key3: 2 },
            { key1: 1, key2: "a", key3: 3 },
            { key1: 1, key2: "c", key3: 4 },
            { key1: 2, key2: "a", key3: 5 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "b", key3: 3 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "c", key3: 7 },
            { key1: 3, key2: "a", key3: 8 },
            { key1: 3, key2: "b", key3: 9 },
            { key1: 3, key2: "b", key3: 0 },
            { key1: 3, key2: "b", key3: -3 },
        ]

        const sd = new SimpleData({ data }).sortValues({
            key: ["key1", "key2", "key3"],
            order: "descending",
            locale: [false, "fr", false],
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "b", key3: 9 },
            { key1: 3, key2: "b", key3: 0 },
            { key1: 3, key2: "b", key3: -3 },
            { key1: 3, key2: "a", key3: 8 },
            { key1: 2, key2: "c", key3: 7 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "b", key3: 6 },
            { key1: 2, key2: "b", key3: 3 },
            { key1: 2, key2: "a", key3: 5 },
            { key1: 1, key2: "c", key3: 4 },
            { key1: 1, key2: "c", key3: 1 },
            { key1: 1, key2: "a", key3: 3 },
            { key1: 1, key2: "a", key3: 2 },
        ])
    })
})
