import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromUrlNode", function () {
    it("should return an array of objects from a csv file", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.csv",
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

    it("should return an array of objects from a text file with a csv format", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.txt",
            format: "csv",
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
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.csv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.tsv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.json",
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

    it("should return an array of objects from multiple files with a specific format", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: [
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/wholeDirectoryText/data1.txt",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/wholeDirectoryText/data2.txt",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/wholeDirectoryText/data3.txt",
            ],
            format: "csv",
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

    it("should return an array of objects from multiple files with the file name as value", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: [
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.csv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.tsv",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.json",
            ],
            fileNameAsValue: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2", file: "data.csv" },
            { key1: "3", key2: "coucou", file: "data.csv" },
            { key1: "8", key2: "10", file: "data.csv" },
            { key1: "brioche", key2: "croissant", file: "data.csv" },
            { key1: "1", key2: "2", file: "data.tsv" },
            { key1: "3", key2: "coucou", file: "data.tsv" },
            { key1: "8", key2: "10", file: "data.tsv" },
            { key1: "brioche", key2: "croissant", file: "data.tsv" },
            { key1: 1, key2: 2, file: "data.json" },
            { key1: 3, key2: "coucou", file: "data.json" },
            { key1: 8, key2: 10, file: "data.json" },
            { key1: "brioche", key2: "croissant", file: "data.json" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included", async function () {
        const sd = await new SimpleDataNode().loadDataFromUrl({
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.csv",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dataExtraLines.csv",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dataExtraLines.csv",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.tsv",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.tsv",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.json",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.json",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.json",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.csv",
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
            url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/data.tsv",
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
