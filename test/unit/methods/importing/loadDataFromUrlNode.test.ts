import assert from "assert"
import loadDataFromUrlNode from "../../../../src/methods/importing/loadDataFromUrlNode.js"

describe("loadDataFromUrlNode", function () {
    it("should return an array of objects from a csv file", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.csv"
        )
        assert.deepEqual(data, [
            {
                key1: 1,
                key2: 2,
            },
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
            {
                key1: "brioche",
                key2: "croissant",
            },
        ])
    })

    it("should return an array of objects from a csv file with specific items included", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.csv",
            false,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
        ])
    })

    it("should return an array of objects from a tsv file", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.tsv"
        )
        assert.deepEqual(data, [
            {
                key1: 1,
                key2: 2,
            },
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
            {
                key1: "brioche",
                key2: "croissant",
            },
        ])
    })

    it("should return an array of objects from a tsv file with specific items included", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.tsv",
            false,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
        ])
    })

    it("should return an array of objects from a json file", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.json"
        )
        assert.deepEqual(data, [
            {
                key1: 1,
                key2: 2,
            },
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
            {
                key1: "brioche",
                key2: "croissant",
            },
        ])
    })

    it("should return an array of objects from a json file with specific items included", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.json",
            false,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
        ])
    })

    it("should return an array of objects from an object of arrays", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTestArrays.json",
            false,
            true
        )
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with types inferred", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.csv",
            true,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
        ])
    })
    it("should return an array of objects from a tsv file with types inferred", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.tsv",
            true,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            {
                key1: 3,
                key2: "coucou",
            },
            {
                key1: 8,
                key2: 10,
            },
        ])
    })
})
