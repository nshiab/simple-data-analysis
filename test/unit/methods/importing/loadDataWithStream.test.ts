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

    it("should return an array of objects from a csv file without headers", async function () {
        const sd = await new SimpleDataNode().loadDataWithStream({
            path: "./test/data/files/dataNoHeaders.csv",
            headers: ["key1", "key2"],
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

    it("should return an array of objects from a text file with a specific format", async function () {
        const sd = await new SimpleDataNode().loadDataWithStream({
            path: "./test/data/files/data.txt",
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
    it("should return an array of objects from multiple files with a specific format", async function () {
        const sd = await new SimpleDataNode().loadDataWithStream({
            path: [
                "./test/data/wholeDirectoryText/data1.txt",
                "./test/data/wholeDirectoryText/data2.txt",
                "./test/data/wholeDirectoryText/data3.txt",
            ],
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
