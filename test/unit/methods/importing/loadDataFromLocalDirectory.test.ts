import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromLocalDirectory", function () {
    it("should return an array of objects from a directory with data files", function () {
        const sd = new SimpleDataNode().loadDataFromLocalDirectory({
            path: "./test/data/wholeDirectory/",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
            { key1: 1, key2: 2 },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: 10 },
            { key1: "brioche", key2: "croissant" },
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should return an array of objects from a directory with data files file id key as file name", function () {
        const sd = new SimpleDataNode().loadDataFromLocalDirectory({
            path: "./test/data/wholeDirectory/",
            fileNameAsId: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2", id: "data.csv" },
            { key1: "3", key2: "coucou", id: "data.csv" },
            { key1: "8", key2: "10", id: "data.csv" },
            { key1: "brioche", key2: "croissant", id: "data.csv" },
            { key1: 1, key2: 2, id: "data.json" },
            { key1: 3, key2: "coucou", id: "data.json" },
            { key1: 8, key2: 10, id: "data.json" },
            { key1: "brioche", key2: "croissant", id: "data.json" },
            { key1: "1", key2: "2", id: "data.tsv" },
            { key1: "3", key2: "coucou", id: "data.tsv" },
            { key1: "8", key2: "10", id: "data.tsv" },
            { key1: "brioche", key2: "croissant", id: "data.tsv" },
        ])
    })
})
