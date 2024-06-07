import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("cleanColumnNames", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should clean column names", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/employees.csv")
        await table.cleanColumnNames()
        const columns = await table.getColumns()
        assert.deepStrictEqual(columns, [
            "name",
            "hireDate",
            "job",
            "salary",
            "departmentOrUnit",
            "endOfYearBonus",
        ])
    })
})
