import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("loadFile", () => {
    const simpleNodeDB = new SimpleNodeDB({ verbose: true }).start()

    it("should load data from a csv file", async () => {
        await simpleNodeDB.loadCSV("dataCsv", "test/data/files/data.csv")

        const data = await simpleNodeDB.getData("dataCsv")

        assert.deepStrictEqual(
            [
                { key1: "1", key2: "2" },
                { key1: "3", key2: "coucou" },
                { key1: "8", key2: "10" },
                { key1: "brioche", key2: "croissant" },
            ],
            data
        )
    })
    it("should load data from a csv file after skypping some lines at the top", async () => {
        await simpleNodeDB.loadCSV(
            "dataCsvSkip",
            "test/data/files/dataExtraLines.csv",
            {
                skip: 2,
            }
        )
        const data = await simpleNodeDB.getData("dataCsvSkip")
        assert.deepStrictEqual(
            [
                { key1: "1", key2: "2" },
                { key1: "3", key2: "coucou" },
                { key1: "8", key2: "10" },
                { key1: "brioche", key2: "croissant" },
            ],
            data
        )
    })
})
