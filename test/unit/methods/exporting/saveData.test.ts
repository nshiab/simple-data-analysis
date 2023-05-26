import { SimpleDataNode } from "../../../../src/index.js"

describe("saveData", function () {
    it("should save the data as a csv file", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        new SimpleDataNode({ data }).saveData({
            path: "./test/output/savedData.csv",
        })
    })
    it("should save the data as a json file", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        new SimpleDataNode({ data }).saveData({
            path: "./test/output/savedData.json",
        })
    })
    it("should save the data as a json file with data as arrays", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        new SimpleDataNode({ data }).saveData({
            path: "./test/output/savedDataArrays.json",
            dataAsArrays: true,
        })
    })
})
