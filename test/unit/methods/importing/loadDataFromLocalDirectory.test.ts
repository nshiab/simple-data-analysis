import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromLocalDirectory", function () {
    it("should return an array of objects from a directory with data files", function () {
        const sd = new SimpleDataNode().loadDataFromLocalDirectory({
            path: "./test/data/repositoryTest/",
        })
        assert.deepEqual(sd.getData(), [
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
            path: "./test/data/repositoryTest/",
            fileNameAsId: true,
        })
        assert.deepEqual(sd.getData(), [
            { key1: "1", key2: "2", id: "localFileTest.csv" },
            { key1: "3", key2: "coucou", id: "localFileTest.csv" },
            { key1: "8", key2: "10", id: "localFileTest.csv" },
            { key1: "brioche", key2: "croissant", id: "localFileTest.csv" },
            { key1: 1, key2: 2, id: "localFileTest.json" },
            { key1: 3, key2: "coucou", id: "localFileTest.json" },
            { key1: 8, key2: 10, id: "localFileTest.json" },
            { key1: "brioche", key2: "croissant", id: "localFileTest.json" },
            { key1: "1", key2: "2", id: "localFileTest.tsv" },
            { key1: "3", key2: "coucou", id: "localFileTest.tsv" },
            { key1: "8", key2: "10", id: "localFileTest.tsv" },
            { key1: "brioche", key2: "croissant", id: "localFileTest.tsv" },
        ])
    })
})
