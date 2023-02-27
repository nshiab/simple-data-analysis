import assert from "assert"
import loadDataFromLocalFile from "../../../../src/methods/importing/loadDataFromLocalFile.js"

describe("loadDataFromLocalFile", function () {
    it("should return an array of objects from a csv file", function () {
        const data = loadDataFromLocalFile("./test/data/localFileTest.csv")
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from multiple files", function () {
        const data = loadDataFromLocalFile([
            "./test/data/localFileTest.csv",
            "./test/data/localFileTest.tsv",
            "./test/data/localFileTest.json",
        ])
        assert.deepEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTest.csv",
            false,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a csv file while skipping rows", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTestExtraLines.csv",
            false,
            false,
            undefined,
            undefined,
            2,
            3
        )
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included, while skipping rows", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTestExtraLines.csv",
            false,
            false,
            1,
            2,
            2,
            3
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a tsv file", function () {
        const data = loadDataFromLocalFile("./test/data/localFileTest.tsv")
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a tsv file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTest.tsv",
            false,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a json file", function () {
        const data = loadDataFromLocalFile("./test/data/localFileTest.json")
        assert.deepEqual(data, [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a json file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTest.json",
            false,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from an object of arrays", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTestArrays.json",
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

    it("should return an array of objects from a csv file with inferred types", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTest.csv",
            true,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })
    it("should return an array of objects from a tsv file with inferred types", function () {
        const data = loadDataFromLocalFile(
            "./test/data/localFileTest.tsv",
            true,
            false,
            1,
            2
        )
        assert.deepEqual(data, [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })
})
