import { SimpleDataNode } from "../../../../src/index.js"

describe("saveDataWithStream", function () {
    it("should save the data as a csv file with stream", async function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        await new SimpleDataNode({ data }).saveDataWithStream({
            path: "./test/output/savedDataWithStream.csv",
        })
    })
})
