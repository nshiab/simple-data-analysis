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
    it("should return an array of objects from a directory with text files and a specific format", function () {
        const sd = new SimpleDataNode().loadDataFromLocalDirectory({
            path: "./test/data/wholeDirectoryText/",
            format: "csv",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
            { key1: "5", key2: "6" },
            { key1: "miam", key2: "patate" },
            { key1: "89", key2: "2" },
            { key1: "brb", key2: "tbh" },
            { key1: "10", key2: "20" },
            { key1: "30", key2: "hi" },
            { key1: "1", key2: "0" },
            { key1: "testing", key2: "extension" },
        ])
    })
    it("should return an array of objects from a directory with the file name as value", function () {
        const sd = new SimpleDataNode().loadDataFromLocalDirectory({
            path: "./test/data/wholeDirectory/",
            fileNameAsValue: true,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: "1", key2: "2", file: "data.csv" },
            { key1: "3", key2: "coucou", file: "data.csv" },
            { key1: "8", key2: "10", file: "data.csv" },
            { key1: "brioche", key2: "croissant", file: "data.csv" },
            { key1: 1, key2: 2, file: "data.json" },
            { key1: 3, key2: "coucou", file: "data.json" },
            { key1: 8, key2: 10, file: "data.json" },
            { key1: "brioche", key2: "croissant", file: "data.json" },
            { key1: "1", key2: "2", file: "data.tsv" },
            { key1: "3", key2: "coucou", file: "data.tsv" },
            { key1: "8", key2: "10", file: "data.tsv" },
            { key1: "brioche", key2: "croissant", file: "data.tsv" },
        ])
    })
})
