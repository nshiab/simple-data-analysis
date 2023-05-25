import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataWithStream", function () {
    it("should return an array of objects from a csv file", async function () {
        const sd = await new SimpleDataNode().loadDataWithStream({
            path: "./test/data/files/data.csv",
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
        const sd = await new SimpleDataNode().loadDataWithStream({
            path: ["./test/data/files/data.csv", "./test/data/files/data.tsv"],
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
        ])
    })

    it("should return an array of objects from multiple files with the file name as value", async function () {
        const sd = await new SimpleDataNode().loadDataWithStream({
            path: ["./test/data/files/data.csv", "./test/data/files/data.tsv"],
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
        ])
    })
})
