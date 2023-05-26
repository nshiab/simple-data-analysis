import writeFileWithStream from "../../../src/helpers/writeFileWithStream.js"
import { SimpleDataItem } from "../../../src/index.js"

describe("writeFileWithStream", function () {
    it("should return the data in a csv file while using stream", async function () {
        const data: SimpleDataItem[] = [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ]
        await writeFileWithStream(
            data,
            "./test/output/dataWrittenWithStream.csv",
            "utf8",
            false,
            false
        )
    })
})
