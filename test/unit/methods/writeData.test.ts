import { existsSync, mkdirSync } from "fs"
import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("writeData", () => {
    const output = "./test/output/"

    let sdb: SimpleDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        sdb = new SimpleDB()
    })

    const expectedData = [
        { key1: "1", key2: "2" },
        { key1: "3", key2: "coucou" },
        { key1: "8", key2: "10" },
        { key1: "brioche", key2: "croissant" },
    ]

    after(async function () {
        await sdb.done()
    })

    it("should write a csv file", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}test.csv`)

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}test.csv`])
        const data = await table.getData()

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a csv file and create the path if it doesn't exist", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}subfolderData/test.csv`)

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}subfolderData/test.csv`])
        const data = await table.getData()

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a compressed csv file", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}test.csv`, {
            compression: true,
        })

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}test.csv.gz`])
        const data = await tableCheck.getData()

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a json file", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}test.json`)

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}test.json`])
        const data = await tableCheck.getData()

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a compressed json file", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}test.json`, {
            compression: true,
        })

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}test.json.gz`])
        const data = await tableCheck.getData()

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a parquet file", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}test.parquet`)

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}test.parquet`])
        const data = await tableCheck.getData()

        assert.deepStrictEqual(data, expectedData)
    })
    it("should write a compressed parquet file", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/data.csv")
        await table.writeData(`${output}testCompressed.parquet`, {
            compression: true,
        })

        // We test the content of the file
        const tableCheck = sdb.newTable()
        await tableCheck.loadData([`${output}testCompressed.parquet`])
        const data = await tableCheck.getData()

        assert.deepStrictEqual(data, expectedData)
    })
})
