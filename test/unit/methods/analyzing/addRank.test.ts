import assert from "assert"
import addRank from "../../../../src/methods/analyzing/addRank.js"

describe("addRank", function () {
    it("should add rank based on array index", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const rankData = addRank(data, "rank")
        assert.deepEqual(rankData, [
            { key1: 1, rank: 1 },
            { key1: 2, rank: 2 },
            { key1: 3, rank: 3 },
            { key1: 4, rank: 4 },
            { key1: 5, rank: 5 },
        ])
    })
    it("should add rank based on array key parameter", function () {
        const data = [
            { key1: 111 },
            { key1: 21 },
            { key1: 32 },
            { key1: 11 },
            { key1: 2 },
        ]
        const rankData = addRank(data, "key1Rank", "key1")
        assert.deepEqual(rankData, [
            { key1: 111, key1Rank: 1 },
            { key1: 21, key1Rank: 3 },
            { key1: 32, key1Rank: 2 },
            { key1: 11, key1Rank: 4 },
            { key1: 2, key1Rank: 5 },
        ])
    })
    it("should add rank based on array key parameter, even though there are duplicates", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 22 },
            { key1: 2 },
        ]
        const rankData = addRank(data, "key1Rank", "key1")
        assert.deepEqual(rankData, [
            { key1: 111, key1Rank: 1 },
            { key1: 22, key1Rank: 2 },
            { key1: 22, key1Rank: 2 },
            { key1: 22, key1Rank: 2 },
            { key1: 2, key1Rank: 3 },
        ])
    })
    it("should add rank based on array key parameter, and handle ties by index ignoring ties", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 22 },
            { key1: 2 },
        ]
        const rankData = addRank(
            data,
            "key1Rank",
            "key1",
            false,
            undefined,
            "noTie"
        )
        assert.deepEqual(rankData, [
            { key1: 111, key1Rank: 1 },
            { key1: 22, key1Rank: 2 },
            { key1: 22, key1Rank: 3 },
            { key1: 22, key1Rank: 4 },
            { key1: 2, key1Rank: 5 },
        ])
    })
    it("should add rank based on array key parameter, with ties having the same rank and non ties being based on sorted index", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 23 },
            { key1: 2 },
        ]
        const rankData = addRank(
            data,
            "key1Rank",
            "key1",
            false,
            undefined,
            "tie"
        )
        assert.deepEqual(rankData, [
            { key1: 111, key1Rank: 1 },
            { key1: 22, key1Rank: 3 },
            { key1: 22, key1Rank: 3 },
            { key1: 23, key1Rank: 2 },
            { key1: 2, key1Rank: 5 },
        ])
    })
    it("should add rank based on array key parameter, with ties having the same rank and non ties following in sequential order", function () {
        const data = [
            { key1: 111 },
            { key1: 22 },
            { key1: 22 },
            { key1: 23 },
            { key1: 2 },
        ]
        const rankData = addRank(
            data,
            "key1Rank",
            "key1",
            false,
            undefined,
            "tieNoGaps"
        )
        assert.deepEqual(rankData, [
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
        const sortedData = addRank(
            data,
            "key1Rank",
            "key1",
            false,
            undefined,
            "tieNoGaps",
            "fr"
        )
        assert.deepEqual(sortedData, [
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
        const sortedData = addRank(
            data,
            "multiKey",
            ["key1", "key2", "key3"],
            false,
            undefined,
            "tieNoGaps",
            [false, "fr", false]
        )

        assert.deepEqual(sortedData, [
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
        const rankData = addRank(data, "key1Rank", "key1", true)
        assert.deepEqual(rankData, [
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
        const rankData = addRank(data, "key1Rank", "key1", true, "ascending")
        assert.deepEqual(rankData, [
            { key1: 1, key1Rank: 1 },
            { key1: 2, key1Rank: 2 },
            { key1: 3, key1Rank: 3 },
            { key1: 4, key1Rank: 4 },
            { key1: 5, key1Rank: 5 },
        ])
    })
    it("should add rank based on array key parameter, with an existing key for the rank title. Should throw an error", function () {
        const data = [
            { key1: 111 },
            { key1: 21 },
            { key1: 32 },
            { key1: 11 },
            { key1: 2 },
        ]
        assert.throws(() => addRank(data, "key1", "key1"), Error)
    })
})
