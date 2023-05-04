import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromUrlNode", function () {
    it("should return an array of objects from a csv file", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.csv",
        })
        assert.deepStrictEqual(sd.getData(), [
            {
                key1: "1",
                key2: "2",
            },
            {
                key1: "3",
                key2: "coucou",
            },
            {
                key1: "8",
                key2: "10",
            },
            {
                key1: "brioche",
                key2: "croissant",
            },
        ])
    })

    it("should return an array of objects from multiple files", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: [
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.csv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.tsv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.json",
            ],
        })
        assert.deepStrictEqual(sd.getData(), [
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

    it("should return an array of objects from multiple files with the file name as id", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: [
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.csv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.tsv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.json",
            ],
            fileNameAsId: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2", id: "localFileTest.csv" },
            { key1: "3", key2: "coucou", id: "localFileTest.csv" },
            { key1: "8", key2: "10", id: "localFileTest.csv" },
            { key1: "brioche", key2: "croissant", id: "localFileTest.csv" },
            { key1: "1", key2: "2", id: "localFileTest.tsv" },
            { key1: "3", key2: "coucou", id: "localFileTest.tsv" },
            { key1: "8", key2: "10", id: "localFileTest.tsv" },
            { key1: "brioche", key2: "croissant", id: "localFileTest.tsv" },
            { key1: 1, key2: 2, id: "localFileTest.json" },
            { key1: 3, key2: "coucou", id: "localFileTest.json" },
            { key1: 8, key2: 10, id: "localFileTest.json" },
            { key1: "brioche", key2: "croissant", id: "localFileTest.json" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.csv",
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            {
                key1: "3",
                key2: "coucou",
            },
            {
                key1: "8",
                key2: "10",
            },
        ])
    })

    it("should return an array of objects from a csv file while skipping rows", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTestExtraLines.csv",
            nbFirstRowsToExclude: 2,
            nbLastRowsToExclude: 3,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included, while skipping rows", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTestExtraLines.csv",
            firstItem: 1,
            lastItem: 2,
            nbFirstRowsToExclude: 2,
            nbLastRowsToExclude: 3,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
        ])
    })

    it("should return an array of objects from a tsv file", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.tsv",
        })
        assert.deepStrictEqual(sd.getData(), [
            {
                key1: "1",
                key2: "2",
            },
            {
                key1: "3",
                key2: "coucou",
            },
            {
                key1: "8",
                key2: "10",
            },
            {
                key1: "brioche",
                key2: "croissant",
            },
        ])
    })

    it("should return an array of objects from a tsv file with specific items included", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.tsv",
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            {
                key1: "3",
                key2: "coucou",
            },
            {
                key1: "8",
                key2: "10",
            },
        ])
    })

    it("should return an array of objects from a json file", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.json",
        })
        assert.deepStrictEqual(sd.getData(), [
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
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.json",
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
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
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTestArrays.json",
            dataAsArrays: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with types inferred", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.csv",
            autoType: true,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
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
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/localFileTest.tsv",
            autoType: true,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
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
