import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromLocalFile", function () {
    it("should return an array of objects from a csv file", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.csv",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from multiple files", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: [
                "./test/data/localFileTest.csv",
                "./test/data/localFileTest.tsv",
                "./test/data/localFileTest.json",
            ],
        })
        assert.deepEqual(sd.getData(), [
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

    it("should return an array of objects from multiple files with an id as filename", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: [
                "./test/data/localFileTest.csv",
                "./test/data/localFileTest.tsv",
                "./test/data/localFileTest.json",
            ],
            fileNameAsId: true,
        })

        assert.deepEqual(sd.getData(), [
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

    it("should return an array of objects from a csv file with specific items included", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.csv",
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a csv file while skipping rows", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTestExtraLines.csv",
            nbFirstRowsToExclude: 2,
            nbLastRowsToExclude: 3,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included, while skipping rows", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTestExtraLines.csv",
            nbFirstRowsToExclude: 2,
            nbLastRowsToExclude: 3,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a tsv file", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.tsv",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a tsv file with specific items included", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.tsv",
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from a json file", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.json",
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a json file with specific items included", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.json",
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })

    it("should return an array of objects from an object of arrays", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTestArrays.json",
            dataAsArrays: true,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with inferred types", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.csv",
            autoType: true,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })
    it("should return an array of objects from a tsv file with inferred types", function () {
        const sd = new SimpleDataNode().loadDataFromLocalFile({
            path: "./test/data/localFileTest.tsv",
            autoType: true,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
        ])
    })
})
