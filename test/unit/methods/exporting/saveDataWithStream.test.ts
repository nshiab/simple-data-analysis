import { existsSync, mkdirSync } from "fs"
import { SimpleDataNode } from "../../../../src/index.js"

const outputPath = "./test/output/"
if (!existsSync(outputPath)) {
    mkdirSync(outputPath)
}

describe("saveDataWithStream", function () {
    it("should save the data as a csv file with stream", async function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        await new SimpleDataNode({ data }).saveDataWithStream({
            path: `${outputPath}savedDataWithStream.csv`,
        })
    })
})
