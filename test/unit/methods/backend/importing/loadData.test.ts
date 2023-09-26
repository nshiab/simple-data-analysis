import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("loadData", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should load data from a csv file", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

        const data = await simpleNodeDB.getData("dataCsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data with dates", async () => {
        await simpleNodeDB.loadData("dataDates", [
            "test/data/files/dataDates.csv",
        ])

        const data = await simpleNodeDB.getData("dataDates")

        assert.deepStrictEqual(data, [
            {
                date: new Date("2010-01-01T00:00:00.000Z"),
                datetime: new Date("2010-01-01T14:01:12.000Z"),
                datetimeWithMs: new Date("2010-01-01T14:12:12.014Z"),
                time: "14:12:12",
                timeMs: "14:12:12.014",
            },
            {
                date: new Date("2010-01-02T00:00:00.000Z"),
                datetime: new Date("2010-01-02T01:12:54.000Z"),
                datetimeWithMs: new Date("2010-01-02T01:12:54.955Z"),
                time: "01:12:54",
                timeMs: "01:12:54.955",
            },
            {
                date: new Date("2010-01-03T00:00:00.000Z"),
                datetime: new Date("2010-01-03T02:25:01.000Z"),
                datetimeWithMs: new Date("2010-01-03T02:25:01.111Z"),
                time: "02:25:01",
                timeMs: "02:25:01.111",
            },
            {
                date: new Date("2010-01-04T00:00:00.000Z"),
                datetime: new Date("2010-01-04T23:25:15.000Z"),
                datetimeWithMs: new Date("2010-01-04T12:01:15.123Z"),
                time: "12:01:15",
                timeMs: "12:01:15.123",
            },
        ])
    })
    it("should load data from a fetched csv file", async () => {
        await simpleNodeDB.loadData("dataFetchCsv", [
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/files/data.csv",
        ])

        const data = await simpleNodeDB.getData("dataFetchCsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
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
        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a tsv file", async () => {
        await simpleNodeDB.loadData("dataTsv", ["test/data/files/data.tsv"], {
            fileType: "dsv",
        })

        const data = await simpleNodeDB.getData("dataTsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a txt file", async () => {
        await simpleNodeDB.loadData("dataTxt", ["test/data/files/data.txt"], {
            fileType: "dsv",
        })

        const data = await simpleNodeDB.getData("dataTxt")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a json file", async () => {
        await simpleNodeDB.loadData("dataJson", ["test/data/files/data.json"])

        const data = await simpleNodeDB.getData("dataJson")

        assert.deepStrictEqual(data, [
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
        ])
    })
    it("should load data from a parquet file", async () => {
        await simpleNodeDB.loadData("dataParquet", [
            "test/data/files/data.parquet",
        ])

        const data = await simpleNodeDB.getData("dataParquet")

        assert.deepStrictEqual(data, [
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
        ])
    })
    it("should load data from a compressed parquet file", async () => {
        await simpleNodeDB.loadData("dataParquetCompressed", [
            "test/data/files/data.parquet",
        ])

        const data = await simpleNodeDB.getData("dataParquetCompressed")

        assert.deepStrictEqual(data, [
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
        ])
    })
    it("should load data from multiple files", async () => {
        await simpleNodeDB.loadData("multipleFiles", [
            "test/data/directory/data1.csv",
            "test/data/directory/data2.csv",
            "test/data/directory/data3.csv",
        ])

        const data = await simpleNodeDB.getData("multipleFiles")

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un" },
            { key1: 2, key2: "deux" },
            { key1: 3, key2: "trois" },
            { key1: 4, key2: "quatre" },
            { key1: 5, key2: "cinq" },
            { key1: 6, key2: "six" },
            { key1: 7, key2: "sept" },
            { key1: 8, key2: "huit" },
            { key1: 9, key2: "neuf" },
            { key1: 10, key2: "dix" },
            { key1: 11, key2: "onze" },
        ])
    })
    it("should load data from multiple files and add a column with the file name.", async () => {
        await simpleNodeDB.loadData(
            "multipleFilesFileName",
            [
                "test/data/directory/data1.csv",
                "test/data/directory/data2.csv",
                "test/data/directory/data3.csv",
            ],
            { fileName: true }
        )

        const data = await simpleNodeDB.getData("multipleFilesFileName")

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: "un",
                filename: "test/data/directory/data1.csv",
            },
            {
                key1: 2,
                key2: "deux",
                filename: "test/data/directory/data1.csv",
            },
            {
                key1: 3,
                key2: "trois",
                filename: "test/data/directory/data1.csv",
            },
            {
                key1: 4,
                key2: "quatre",
                filename: "test/data/directory/data1.csv",
            },
            {
                key1: 5,
                key2: "cinq",
                filename: "test/data/directory/data2.csv",
            },
            {
                key1: 6,
                key2: "six",
                filename: "test/data/directory/data2.csv",
            },
            {
                key1: 7,
                key2: "sept",
                filename: "test/data/directory/data2.csv",
            },
            {
                key1: 8,
                key2: "huit",
                filename: "test/data/directory/data2.csv",
            },
            {
                key1: 9,
                key2: "neuf",
                filename: "test/data/directory/data3.csv",
            },
            {
                key1: 10,
                key2: "dix",
                filename: "test/data/directory/data3.csv",
            },
            {
                key1: 11,
                key2: "onze",
                filename: "test/data/directory/data3.csv",
            },
        ])
    })
    it("should load data from multiple files and unify the columns.", async () => {
        await simpleNodeDB.loadData(
            "multipleFilesColumns",
            [
                "test/data/directory/data1.csv",
                "test/data/directory/data2.csv",
                "test/data/directory/data3.csv",
                "test/data/directory/data4ExtraColumn.csv",
            ],
            { unifyColumns: true }
        )

        const data = await simpleNodeDB.getData("multipleFilesColumns")
        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un", key3: null },
            { key1: 2, key2: "deux", key3: null },
            { key1: 3, key2: "trois", key3: null },
            { key1: 4, key2: "quatre", key3: null },
            { key1: 5, key2: "cinq", key3: null },
            { key1: 6, key2: "six", key3: null },
            { key1: 7, key2: "sept", key3: null },
            { key1: 8, key2: "huit", key3: null },
            { key1: 9, key2: "neuf", key3: null },
            { key1: 10, key2: "dix", key3: null },
            { key1: 11, key2: "onze", key3: null },
            { key1: 9, key2: "neuf", key3: "nine" },
            { key1: 10, key2: "dix", key3: "ten" },
            { key1: 11, key2: "onze", key3: "eleven" },
        ])
    })

    simpleNodeDB.done()
})
