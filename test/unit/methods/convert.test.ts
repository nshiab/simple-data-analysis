import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("convert", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should convert numbers to string", async () => {
        await simpleNodeDB.loadData("dataJustNumbers", [
            "test/data/files/dataJustNumbers.csv",
        ])

        await simpleNodeDB.convert("dataJustNumbers", { key1: "string" })
        const data = await simpleNodeDB.getData("dataJustNumbers")

        assert.deepStrictEqual(data, [
            { key1: "1.3", key2: 2 },
            { key1: "3.0", key2: 15 },
            { key1: "8.5", key2: 10 },
            { key1: "1.0", key2: 154 },
        ])
    })

    it("should try to convert string to number", async () => {
        await simpleNodeDB.loadData(
            "dataMixedTypes",
            ["test/data/files/data.csv"],
            { allText: true }
        )

        await simpleNodeDB.convert(
            "dataMixedTypes",
            { key1: "integer" },
            { try: true }
        )
        const data = await simpleNodeDB.getData("dataMixedTypes")

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "2" },
            { key1: 3, key2: "coucou" },
            { key1: 8, key2: "10" },
            { key1: null, key2: "croissant" },
        ])
    })

    it("should convert string to float", async () => {
        await simpleNodeDB.convert("dataJustNumbers", { key1: "float" })
        const data = await simpleNodeDB.getData("dataJustNumbers")

        assert.deepStrictEqual(data, [
            { key1: 1.3, key2: 2 },
            { key1: 3, key2: 15 },
            { key1: 8.5, key2: 10 },
            { key1: 1, key2: 154 },
        ])
    })

    it("should convert string to integer", async () => {
        await simpleNodeDB.convert("dataJustNumbers", { key2: "string" })

        await simpleNodeDB.convert("dataJustNumbers", { key2: "integer" })
        const data = await simpleNodeDB.getData("dataJustNumbers")

        assert.deepStrictEqual(data, [
            { key1: 1.3, key2: 2 },
            { key1: 3, key2: 15 },
            { key1: 8.5, key2: 10 },
            { key1: 1, key2: 154 },
        ])
    })

    it("should convert multiple columns in multiple types", async () => {
        await simpleNodeDB.convert("dataJustNumbers", { key1: "string" })

        await simpleNodeDB.convert("dataJustNumbers", {
            key1: "float",
            key2: "string",
        })
        const data = await simpleNodeDB.getData("dataJustNumbers")

        assert.deepStrictEqual(data, [
            { key1: 1.3, key2: "2" },
            { key1: 3, key2: "15" },
            { key1: 8.5, key2: "10" },
            { key1: 1, key2: "154" },
        ])
    })

    it("should convert date string to date", async () => {
        await simpleNodeDB.loadData(
            "dataDates",
            ["test/data/files/dataDates.csv"],
            { allText: true }
        )

        await simpleNodeDB.convert("dataDates", {
            date: "date",
            datetime: "datetime",
            datetimeWithMs: "datetime",
        })

        const data = await simpleNodeDB.getData("dataDates")

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

    it("should convert time string to date", async () => {
        await simpleNodeDB.convert("dataDates", {
            time: "time",
            timeMs: "time",
        })

        const types = await simpleNodeDB.getTypes("dataDates")

        assert.deepStrictEqual(types, {
            date: "DATE",
            datetime: "TIMESTAMP",
            datetimeWithMs: "TIMESTAMP",
            time: "TIME",
            timeMs: "TIME",
            weirdDatetime: "VARCHAR",
        })
    })

    it("should convert date and time from string to date with a specific format", async () => {
        await simpleNodeDB.convert(
            "dataDates",
            { weirdDatetime: "time" },
            {
                datetimeFormat: "%Y/%m/%d_%Hh_%Mmin_%Ssec",
            }
        )
        const data = await simpleNodeDB.getData("dataDates")

        assert.deepStrictEqual(data, [
            {
                date: new Date("2010-01-01T00:00:00.000Z"),
                datetime: new Date("2010-01-01T14:01:12.000Z"),
                datetimeWithMs: new Date("2010-01-01T14:12:12.014Z"),
                time: "14:12:12",
                timeMs: "14:12:12.014",
                weirdDatetime: new Date("2010-01-01T14:01:12.000Z"),
            },
            {
                date: new Date("2010-01-02T00:00:00.000Z"),
                datetime: new Date("2010-01-02T01:12:54.000Z"),
                datetimeWithMs: new Date("2010-01-02T01:12:54.955Z"),
                time: "01:12:54",
                timeMs: "01:12:54.955",
                weirdDatetime: new Date("2010-01-02T01:12:54.000Z"),
            },
            {
                date: new Date("2010-01-03T00:00:00.000Z"),
                datetime: new Date("2010-01-03T02:25:01.000Z"),
                datetimeWithMs: new Date("2010-01-03T02:25:01.111Z"),
                time: "02:25:01",
                timeMs: "02:25:01.111",
                weirdDatetime: new Date("2010-01-03T02:25:54.000Z"),
            },
            {
                date: new Date("2010-01-04T00:00:00.000Z"),
                datetime: new Date("2010-01-04T23:25:15.000Z"),
                datetimeWithMs: new Date("2010-01-04T12:01:15.123Z"),
                time: "12:01:15",
                timeMs: "12:01:15.123",
                weirdDatetime: new Date("2010-01-04T23:25:15.000Z"),
            },
        ])
    })

    it("should convert dates to strings", async () => {
        await simpleNodeDB.convert(
            "dataDates",
            {
                date: "string",
                datetime: "string",
                datetimeWithMs: "string",
                weirdDatetime: "string",
            },
            {
                datetimeFormat: "%Y/%m/%d_%Hh_%Mmin_%Ssec",
            }
        )
        const data = await simpleNodeDB.getData("dataDates")

        assert.deepStrictEqual(data, [
            {
                date: "2010-01-01",
                datetime: "2010-01-01 14:01:12",
                datetimeWithMs: "2010-01-01 14:12:12.014",
                time: "14:12:12",
                timeMs: "14:12:12.014",
                weirdDatetime: "2010-01-01 14:01:12",
            },
            {
                date: "2010-01-02",
                datetime: "2010-01-02 01:12:54",
                datetimeWithMs: "2010-01-02 01:12:54.955",
                time: "01:12:54",
                timeMs: "01:12:54.955",
                weirdDatetime: "2010-01-02 01:12:54",
            },
            {
                date: "2010-01-03",
                datetime: "2010-01-03 02:25:01",
                datetimeWithMs: "2010-01-03 02:25:01.111",
                time: "02:25:01",
                timeMs: "02:25:01.111",
                weirdDatetime: "2010-01-03 02:25:54",
            },
            {
                date: "2010-01-04",
                datetime: "2010-01-04 23:25:15",
                datetimeWithMs: "2010-01-04 12:01:15.123",
                time: "12:01:15",
                timeMs: "12:01:15.123",
                weirdDatetime: "2010-01-04 23:25:15",
            },
        ])
    })

    it("should convert dates to strings with a specific format", async () => {
        await simpleNodeDB.convert("dataDates", {
            date: "datetime",
            datetime: "datetime",
            datetimeWithMs: "datetime",
            weirdDatetime: "datetime",
        })

        await simpleNodeDB.convert(
            "dataDates",
            {
                date: "date",
                datetime: "datetime",
                datetimeWithMs: "datetime",
                weirdDatetime: "datetime",
            },
            {
                datetimeFormat: "%Y/%m/%d_%Hh_%Mmin_%Ssec",
            }
        )
        const data = await simpleNodeDB.getData("dataDates")

        assert.deepStrictEqual(data, [
            {
                date: "2010/01/01_00h_00min_00sec",
                datetime: "2010/01/01_14h_01min_12sec",
                datetimeWithMs: "2010/01/01_14h_12min_12sec",
                time: "14:12:12",
                timeMs: "14:12:12.014",
                weirdDatetime: "2010/01/01_14h_01min_12sec",
            },
            {
                date: "2010/01/02_00h_00min_00sec",
                datetime: "2010/01/02_01h_12min_54sec",
                datetimeWithMs: "2010/01/02_01h_12min_54sec",
                time: "01:12:54",
                timeMs: "01:12:54.955",
                weirdDatetime: "2010/01/02_01h_12min_54sec",
            },
            {
                date: "2010/01/03_00h_00min_00sec",
                datetime: "2010/01/03_02h_25min_01sec",
                datetimeWithMs: "2010/01/03_02h_25min_01sec",
                time: "02:25:01",
                timeMs: "02:25:01.111",
                weirdDatetime: "2010/01/03_02h_25min_54sec",
            },
            {
                date: "2010/01/04_00h_00min_00sec",
                datetime: "2010/01/04_23h_25min_15sec",
                datetimeWithMs: "2010/01/04_12h_01min_15sec",
                time: "12:01:15",
                timeMs: "12:01:15.123",
                weirdDatetime: "2010/01/04_23h_25min_15sec",
            },
        ])
    })
})
