import assert from "assert"
import loadDataFromLocalFile from "../../../../src/methods/importing/loadDataFromLocalFile.js"

describe("loadDataFromLocalFile", function () {
    it("should return an array of objects from a csv file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.csv"
        )
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.csv",
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a tsv file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.tsv"
        )
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a tsv file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.tsv",
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a json file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.json"
        )
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a json file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.json",
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })
})
