import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("loadData", () => {
    const simpleNodeDB = new SimpleNodeDB({ verbose: true }).start()

    it("should load data from a csv file", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

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
    it("should load data from a fetched csv file", async () => {
        await simpleNodeDB.loadData("dataFetchCsv", [
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/files/data.csv",
        ])

        const data = await simpleNodeDB.getData("dataFetchCsv")

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
        await simpleNodeDB.loadData(
            "dataCsvSkip",
            ["test/data/files/dataExtraLines.csv"],
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
    it("should load data from a tsv file", async () => {
        await simpleNodeDB.loadData("dataTsv", ["test/data/files/data.tsv"], {
            fileType: "dsv",
        })

        const data = await simpleNodeDB.getData("dataTsv")

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
    it("should load data from a txt file", async () => {
        await simpleNodeDB.loadData("dataTxt", ["test/data/files/data.txt"], {
            fileType: "dsv",
        })

        const data = await simpleNodeDB.getData("dataTxt")

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
    it("should load data from a json file", async () => {
        await simpleNodeDB.loadData("dataJson", ["test/data/files/data.json"])

        const data = await simpleNodeDB.getData("dataJson")

        assert.deepStrictEqual(
            [
                {
                    key1: 1,
                    key2: "un",
                },
                {
                    key1: 2,
                    key2: "deux",
                },
                {
                    key1: 3,
                    key2: "trois",
                },
                {
                    key1: 4,
                    key2: "quatre",
                },
            ],
            data
        )
    })
    it("should load data from a parquet file", async () => {
        await simpleNodeDB.loadData("dataParquet", [
            "test/data/files/data.parquet",
        ])

        const data = await simpleNodeDB.getData("dataParquet")

        assert.deepStrictEqual(
            [
                {
                    key1: 1,
                    key2: "un",
                },
                {
                    key1: 3,
                    key2: "deux",
                },
                {
                    key1: 8,
                    key2: "trois",
                },
                {
                    key1: 3,
                    key2: "quatre",
                },
            ],
            data
        )
    })
    it("should load data from a compressed parquet file", async () => {
        await simpleNodeDB.loadData("dataParquetCompressed", [
            "test/data/files/data.parquet",
        ])

        const data = await simpleNodeDB.getData("dataParquetCompressed")

        assert.deepStrictEqual(
            [
                {
                    key1: 1,
                    key2: "un",
                },
                {
                    key1: 3,
                    key2: "deux",
                },
                {
                    key1: 8,
                    key2: "trois",
                },
                {
                    key1: 3,
                    key2: "quatre",
                },
            ],
            data
        )
    })
})
