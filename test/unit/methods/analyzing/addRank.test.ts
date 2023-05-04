import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addRank", function () {
    it("should add rank based on array index", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const sd = new SimpleData({ data }).addRank({ newKey: "rank" })
        assert.deepEqual(sd.getData(), [
            { key1: 1, rank: 1 },
            { key1: 2, rank: 2 },
            { key1: 3, rank: 3 },
            { key1: 4, rank: 4 },
            { key1: 5, rank: 5 },
        ])
    })
    it("should add rank based on key parameter", function () {
        const data = [
            { key1: 111 },
            { key1: 21 },
            { key1: 32 },
            { key1: 11 },
            { key1: 2 },
        ]
        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 111, key1Rank: 1 },
            { key1: 21, key1Rank: 3 },
            { key1: 32, key1Rank: 2 },
            { key1: 11, key1Rank: 4 },
            { key1: 2, key1Rank: 5 },
        ])
    })
    it("should add rank based on key parameter, and handle ties by index ignoring ties", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 22 },
            { key1: 2 },
        ]
        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
            handleTies: "noTie",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 111, key1Rank: 1 },
            { key1: 22, key1Rank: 2 },
            { key1: 22, key1Rank: 3 },
            { key1: 22, key1Rank: 4 },
            { key1: 2, key1Rank: 5 },
        ])
    })
    it("should add rank based on key parameter, with ties having the same rank and non ties being based on sorted index", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 23 },
            { key1: 2 },
        ]

        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
            handleTies: "tie",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 111, key1Rank: 1 },
            { key1: 22, key1Rank: 3 },
            { key1: 22, key1Rank: 3 },
            { key1: 23, key1Rank: 2 },
            { key1: 2, key1Rank: 5 },
        ])
    })
    it("should add rank based on key parameter, with ties having the same rank and non ties following in sequential order", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 23 },
            { key1: 2 },
        ]
        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
            handleTies: "tieNoGaps",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 111, key1Rank: 1 },
            { key1: 22, key1Rank: 3 },
            { key1: 22, key1Rank: 3 },
            { key1: 23, key1Rank: 2 },
            { key1: 2, key1Rank: 4 },
        ])
    })
    it("should add rank to string values with accents", function () {
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

        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
            handleTies: "tieNoGaps",
            locale: "fr",
        })
        assert.deepEqual(sd.getData(), [
            { key1: "Autruche", key1Rank: "5" },
            { key1: "Éléphant", key1Rank: "2" },
            { key1: "À la claire fontaine", key1Rank: "7" },
            { key1: "Écouter", key1Rank: "3" },
            { key1: "Escrime", key1Rank: "1" },
            { key1: "Amoureux", key1Rank: "6" },
            { key1: "Écoutant les oiseaux", key1Rank: "4" },
            { key1: "Autruche", key1Rank: "5" },
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
        const sd = new SimpleData({ data }).addRank({
            key: ["key1", "key2", "key3"],
            newKey: "multiKey",
            handleTies: "tieNoGaps",
            locale: [false, "fr", false],
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: "c", key3: 1, multiKey: 10 },
            { key1: 1, key2: "a", key3: 2, multiKey: 12 },
            { key1: 1, key2: "a", key3: 3, multiKey: 11 },
            { key1: 1, key2: "c", key3: 4, multiKey: 9 },
            { key1: 2, key2: "a", key3: 5, multiKey: 8 },
            { key1: 2, key2: "b", key3: 6, multiKey: 6 },
            { key1: 2, key2: "b", key3: 3, multiKey: 7 },
            { key1: 2, key2: "b", key3: 6, multiKey: 6 },
            { key1: 2, key2: "c", key3: 7, multiKey: 5 },
            { key1: 3, key2: "a", key3: 8, multiKey: 4 },
            { key1: 3, key2: "b", key3: 9, multiKey: 1 },
            { key1: 3, key2: "b", key3: 0, multiKey: 2 },
            { key1: 3, key2: "b", key3: -3, multiKey: 3 },
        ])
    })
    it("should sort the data by the key provided for ranking, then rank", function () {
        const data = [
            { key1: 1 },
            { key1: 4 },
            { key1: 5 },
            { key1: 2 },
            { key1: 3 },
        ]
        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
            sortInPlace: true,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 5, key1Rank: 1 },
            { key1: 4, key1Rank: 2 },
            { key1: 3, key1Rank: 3 },
            { key1: 2, key1Rank: 4 },
            { key1: 1, key1Rank: 5 },
        ])
    })
    it("should sort the data by the key provided for ranking, then rank in ascending order", function () {
        const data = [
            { key1: 1 },
            { key1: 4 },
            { key1: 5 },
            { key1: 2 },
            { key1: 3 },
        ]
        const sd = new SimpleData({ data }).addRank({
            key: "key1",
            newKey: "key1Rank",
            sortInPlace: true,
            order: "ascending",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key1Rank: 1 },
            { key1: 2, key1Rank: 2 },
            { key1: 3, key1Rank: 3 },
            { key1: 4, key1Rank: 4 },
            { key1: 5, key1Rank: 5 },
        ])
    })
    it("should throw an error when adding rank based on array key parameter, with an existing key for the rank title. ", function () {
        const data = [
            { key1: 111 },
            { key1: 21 },
            { key1: 32 },
            { key1: 11 },
            { key1: 2 },
        ]

        assert.throws(
            () =>
                new SimpleData({ data }).addRank({
                    key: "key1",
                    newKey: "key1",
                }),
            Error
        )
    })
})
