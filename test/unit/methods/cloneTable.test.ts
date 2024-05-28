import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("cloneTable", () => {
    let sdb: SimpleDB
    let originalTable: SimpleTable
    let originalData: {
        [key: string]: string | number | boolean | Date | null
    }[]
    before(async function () {
        sdb = new SimpleDB()
        originalTable = sdb.newTable("original")
        await originalTable.loadData("test/data/files/employees.csv")
        originalData = await originalTable.getData()
    })
    after(async function () {
        await sdb.done()
    })

    it("should clone a table", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const clone = await table.cloneTable("clone")

        assert.deepStrictEqual(await table.getData(), await clone.getData())
    })
    it("should keep the original table intact", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const clone = await table.cloneTable("clone")
        await clone.addColumn("test", "number", "2")

        assert.deepStrictEqual(await table.getData(), originalData)
    })
    it("should clone a table with a condition", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const clone = await table.cloneTable("clone", {
            condition: `Job = 'Manager'`,
        })

        assert.deepStrictEqual(
            await clone.getData(),
            originalData.filter((d) => d.Job === "Manager")
        )
    })
})
