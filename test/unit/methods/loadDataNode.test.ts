import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("loadData", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should load data from a csv file", async () => {
        await sdb.loadData("dataCsv", ["test/data/files/data.csv"])

        const data = await sdb.getData("dataCsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a csv file with a limit", async () => {
        await sdb.loadData("dataCsv", ["test/data/files/data.csv"], {
            limit: 2,
        })

        const data = await sdb.getData("dataCsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
        ])
    })
    it("should load data from a compressed csv file", async () => {
        await sdb.loadData("dataCsvCompressed", ["test/data/files/data.csv.gz"])

        const data = await sdb.getData("dataCsvCompressed")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data with dates", async () => {
        await sdb.loadData("dataDates", ["test/data/files/dataDates.csv"])

        const data = await sdb.getData("dataDates")

        assert.deepStrictEqual(data, [
            {
                date: new Date("2010-01-01T00:00:00.000Z"),
                datetime: new Date("2010-01-01T14:01:12.000Z"),
                datetimeWithMs: new Date("2010-01-01T14:12:12.014Z"),
                time: "14:12:12",
                timeMs: "14:12:12.014",
                weirdDatetime: "2010/01/01_14h_01min_12sec",
            },
            {
                date: new Date("2010-01-02T00:00:00.000Z"),
                datetime: new Date("2010-01-02T01:12:54.000Z"),
                datetimeWithMs: new Date("2010-01-02T01:12:54.955Z"),
                time: "01:12:54",
                timeMs: "01:12:54.955",
                weirdDatetime: "2010/01/02_01h_12min_54sec",
            },
            {
                date: new Date("2010-01-03T00:00:00.000Z"),
                datetime: new Date("2010-01-03T02:25:01.000Z"),
                datetimeWithMs: new Date("2010-01-03T02:25:01.111Z"),
                time: "02:25:01",
                timeMs: "02:25:01.111",
                weirdDatetime: "2010/01/03_02h_25min_54sec",
            },
            {
                date: new Date("2010-01-04T00:00:00.000Z"),
                datetime: new Date("2010-01-04T23:25:15.000Z"),
                datetimeWithMs: new Date("2010-01-04T12:01:15.123Z"),
                time: "12:01:15",
                timeMs: "12:01:15.123",
                weirdDatetime: "2010/01/04_23h_25min_15sec",
            },
        ])
    })
    it("should load data while keeping everything as text", async () => {
        await sdb.loadData("dataDatesText", ["test/data/files/dataDates.csv"], {
            allText: true,
        })

        const data = await sdb.getData("dataDatesText")

        assert.deepStrictEqual(data, [
            {
                date: "2010-01-01",
                datetime: "2010-01-01 14:01:12",
                datetimeWithMs: "2010-01-01 14:12:12.014",
                time: "14:12:12",
                timeMs: "14:12:12.014",
                weirdDatetime: "2010/01/01_14h_01min_12sec",
            },
            {
                date: "2010-01-02",
                datetime: "2010-01-02 01:12:54",
                datetimeWithMs: "2010-01-02 01:12:54.955",
                time: "01:12:54",
                timeMs: "01:12:54.955",
                weirdDatetime: "2010/01/02_01h_12min_54sec",
            },
            {
                date: "2010-01-03",
                datetime: "2010-01-03 02:25:01",
                datetimeWithMs: "2010-01-03 02:25:01.111",
                time: "02:25:01",
                timeMs: "02:25:01.111",
                weirdDatetime: "2010/01/03_02h_25min_54sec",
            },
            {
                date: "2010-01-04",
                datetime: "2010-01-04 23:25:15",
                datetimeWithMs: "2010-01-04 12:01:15.123",
                time: "12:01:15",
                timeMs: "12:01:15.123",
                weirdDatetime: "2010/01/04_23h_25min_15sec",
            },
        ])
    })
    it("should load data from a fetched csv file", async () => {
        await sdb.loadData("dataFetchCsv", [
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis.js/main/test/data/files/data.csv",
        ])

        const data = await sdb.getData("dataFetchCsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a csv file after skypping some lines at the top", async () => {
        await sdb.loadData(
            "dataCsvSkip",
            ["test/data/files/dataExtraLines.csv"],
            {
                skip: 2,
            }
        )
        const data = await sdb.getData("dataCsvSkip")
        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a tsv file", async () => {
        await sdb.loadData("dataTsv", ["test/data/files/data.tsv"], {
            fileType: "dsv",
        })

        const data = await sdb.getData("dataTsv")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a txt file", async () => {
        await sdb.loadData("dataTxt", ["test/data/files/data.txt"], {
            fileType: "dsv",
        })

        const data = await sdb.getData("dataTxt")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a compressed txt file", async () => {
        await sdb.loadData(
            "dataTxtCompressed",
            ["test/data/files/dataCsvCompressed.txt"],
            {
                fileType: "csv",
                compression: "gzip",
            }
        )

        const data = await sdb.getData("dataTxtCompressed")

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should load data from a json file", async () => {
        await sdb.loadData("dataJson", ["test/data/files/data.json"])

        const data = await sdb.getData("dataJson")

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
    it("should load data from a json file with a limit", async () => {
        await sdb.loadData("dataJson", ["test/data/files/data.json"], {
            limit: 2,
        })

        const data = await sdb.getData("dataJson")

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: "un",
            },
            {
                key1: 2,
                key2: "deux",
            },
        ])
    })
    it("should load data from a json file and keep the bigint", async () => {
        const sdbBigInt = new SimpleDB({
            bigIntToInt: false,
        })
        await sdbBigInt.loadData("dataJson", ["test/data/files/data.json"])

        const data = await sdbBigInt.getData("dataJson")

        assert.deepStrictEqual(data, [
            {
                key1: BigInt(1),
                key2: "un",
            },
            {
                key1: BigInt(2),
                key2: "deux",
            },
            {
                key1: BigInt(3),
                key2: "trois",
            },
            {
                key1: BigInt(4),
                key2: "quatre",
            },
        ])
    })
    it("should load data from a parquet file", async () => {
        await sdb.loadData("dataParquet", ["test/data/files/data.parquet"])

        const data = await sdb.getData("dataParquet")

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
    it("should load data from a parquet file", async () => {
        await sdb.loadData("dataParquet", ["test/data/files/data.parquet"], {
            limit: 2,
        })

        const data = await sdb.getData("dataParquet")

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: "un",
            },
            {
                key1: 3,
                key2: "deux",
            },
        ])
    })
    it("should load data from a compressed parquet file", async () => {
        await sdb.loadData("dataParquetCompressed", [
            "test/data/files/data.parquet",
        ])

        const data = await sdb.getData("dataParquetCompressed")

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
        await sdb.loadData("multipleFiles", [
            "test/data/directory/data1.csv",
            "test/data/directory/data2.csv",
            "test/data/directory/data3.csv",
        ])

        const data = await sdb.getData("multipleFiles")

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
        await sdb.loadData(
            "multipleFilesFileName",
            [
                "test/data/directory/data1.csv",
                "test/data/directory/data2.csv",
                "test/data/directory/data3.csv",
            ],
            { fileName: true }
        )

        const data = await sdb.getData("multipleFilesFileName")

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
        await sdb.loadData(
            "multipleFilesColumns",
            [
                "test/data/directory/data1.csv",
                "test/data/directory/data2.csv",
                "test/data/directory/data3.csv",
                "test/data/directory/data4ExtraColumn.csv",
            ],
            { unifyColumns: true }
        )

        const data = await sdb.getData("multipleFilesColumns")
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
    it("should load data from a json file with specific types for each column", async () => {
        await sdb.loadData("dataJson", ["test/data/files/data.json"], {
            columnTypes: {
                key1: "VARCHAR",
                key2: "VARCHAR",
            },
        })

        const data = await sdb.getData("dataJson")

        assert.deepStrictEqual(data, [
            {
                key1: "1",
                key2: "un",
            },
            {
                key1: "2",
                key2: "deux",
            },
            {
                key1: "3",
                key2: "trois",
            },
            {
                key1: "4",
                key2: "quatre",
            },
        ])
    })
    // Doesn't work
    // it("should load data from a xlsx url", async () => {
    //     const sdb = new SimpleDB()
    //     await sdb.loadData("dataXlsxOneSheetUrl", [
    //         "https://github.com/nshiab/simple-data-analysis/raw/main/test/data/files/populations-one-sheet.xlsx",
    //     ])
    //     const data = await sdb.getData("dataXlsxOneSheetUrl")

    //     assert.deepStrictEqual(data, [
    //         { Country: "Canada", "Population (million)": 38 },
    //         { Country: "US", "Population (million)": 332 },
    //         { Country: "France", "Population (million)": 68 },
    //     ])
    // })
    it("should load data from a xlsx file", async () => {
        const sdb = new SimpleDB()
        await sdb.loadData("dataXlsxOneSheet", [
            "test/data/files/populations-one-sheet.xlsx",
        ])
        const data = await sdb.getData("dataXlsxOneSheet")

        assert.deepStrictEqual(data, [
            { Country: "Canada", "Population (million)": 38 },
            { Country: "US", "Population (million)": 332 },
            { Country: "France", "Population (million)": 68 },
        ])
    })
    it("should load data from a xlsx file with a limit", async () => {
        const sdb = new SimpleDB()
        await sdb.loadData(
            "dataXlsxOneSheet",
            ["test/data/files/populations-one-sheet.xlsx"],
            { limit: 2 }
        )
        const data = await sdb.getData("dataXlsxOneSheet")

        assert.deepStrictEqual(data, [
            { Country: "Canada", "Population (million)": 38 },
            { Country: "US", "Population (million)": 332 },
        ])
    })
    it("should load data from a specific sheet in an xlsx file", async () => {
        const sdb = new SimpleDB()
        await sdb.loadData(
            "dataXlsxTwoSheets",
            "test/data/files/populations-two-sheets.xlsx",
            { sheet: "provinces" }
        )
        const data = await sdb.getData("dataXlsxTwoSheets")

        assert.deepStrictEqual(data, [
            { Provinces: "Quebec", "Population (million)": 8 },
            { Provinces: "Ontario", "Population (million)": 15 },
            { Provinces: "British Columbia", "Population (million)": 5 },
        ])
    })
    it("should load data from a xlsx file even if spatial is true", async () => {
        const sdb = new SimpleDB({ spatial: true })
        await sdb.loadData("dataXlsxOneSheet", [
            "test/data/files/populations-one-sheet.xlsx",
        ])
        const data = await sdb.getData("dataXlsxOneSheet")

        assert.deepStrictEqual(data, [
            { Country: "Canada", "Population (million)": 38 },
            { Country: "US", "Population (million)": 332 },
            { Country: "France", "Population (million)": 68 },
        ])
    })
})
