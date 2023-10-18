import { existsSync, mkdirSync } from "fs"
import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("writeData", () => {
    const output = "./test/output/"

    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        simpleNodeDB = await new SimpleNodeDB().start()
    })

    const expectedData = [
        { key1: "1", key2: "2" },
        { key1: "3", key2: "coucou" },
        { key1: "8", key2: "10" },
        { key1: "brioche", key2: "croissant" },
    ]

    after(async function () {
        await simpleNodeDB.done()
    })

    it("should write a csv file", async () => {
        await simpleNodeDB.loadData("testTable", ["test/data/files/data.csv"])
        await simpleNodeDB.writeData("testTable", `${output}test.csv`)

        // We test the content of the file
        const csvDB = await new SimpleNodeDB().start()
        await csvDB.loadData("csv", [`${output}test.csv`])
        const data = await csvDB.getData("csv")

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a compressed csv file", async () => {
        await simpleNodeDB.writeData("testTable", `${output}test.csv`, {
            compression: true,
        })

        // We test the content of the file
        const csvDB = await new SimpleNodeDB().start()
        await csvDB.loadData("csv", [`${output}test.csv.gz`])
        const data = await csvDB.getData("csv")

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a json file", async () => {
        await simpleNodeDB.writeData("testTable", `${output}test.json`)

        // We test the content of the file
        const csvDB = await new SimpleNodeDB().start()
        await csvDB.loadData("json", [`${output}test.json`])
        const data = await csvDB.getData("json")

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a compressed json file", async () => {
        await simpleNodeDB.writeData("testTable", `${output}test.json`, {
            compression: true,
        })

        // We test the content of the file
        const csvDB = await new SimpleNodeDB().start()
        await csvDB.loadData("json", [`${output}test.json.gz`])
        const data = await csvDB.getData("json")

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a parquet file", async () => {
        await simpleNodeDB.writeData("testTable", `${output}test.parquet`)

        // We test the content of the file
        const csvDB = await new SimpleNodeDB().start()
        await csvDB.loadData("parquet", [`${output}test.parquet`])
        const data = await csvDB.getData("parquet")

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a compressed parquet file", async () => {
        await simpleNodeDB.writeData(
            "testTable",
            `${output}testCompressed.parquet`,
            { compression: true }
        )

        // We test the content of the file
        const csvDB = await new SimpleNodeDB().start()
        await csvDB.loadData("parquet", [`${output}testCompressed.parquet`])
        const data = await csvDB.getData("parquet")

        assert.deepStrictEqual(data, expectedData)
    })
})
