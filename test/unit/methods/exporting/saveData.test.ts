import { existsSync, mkdirSync } from "fs"
import { SimpleDataNode } from "../../../../src/index.js"

const outputPath = "./test/output/"
if (!existsSync(outputPath)) {
    mkdirSync(outputPath)
}

describe("saveData", function () {
    it("should save the data as a csv file", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        new SimpleDataNode({ data }).saveData({
            path: `${outputPath}savedData.csv`,
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
    it("should save the data as a json file", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        new SimpleDataNode({ data }).saveData({
            path: `${outputPath}savedData.json`,
        })
    })
    it("should save the data as a json file with data as arrays", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        new SimpleDataNode({ data }).saveData({
            path: `${outputPath}savedDataAsArrays.json`,
            dataAsArrays: true,
        })
    })
})
