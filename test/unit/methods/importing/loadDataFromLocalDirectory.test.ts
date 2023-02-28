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
})
