import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import SimpleWebDB from "../../../src/class/SimpleWebDB.js"

describe("batch", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should run in batches", async () => {
        await sdb.loadData("employeesBatch", "test/data/files/employees.json")
        const run = async (sdb: SimpleWebDB, originalTable: string) => {
            await sdb.convert(
                originalTable,
                { Salary: "number" },
                { try: true }
            )
            await sdb.addColumn(
                originalTable,
                "Salary2",
                "number",
                `Salary * 2`
            )
        }
        await sdb.batch(run, "employeesBatch")

        // To test
        await sdb.loadData("employeesTest", "test/data/files/employees.json")
        await sdb.convert("employeesTest", { Salary: "number" }, { try: true })
        await sdb.addColumn("employeesTest", "Salary2", "number", `Salary * 2`)

        assert.deepStrictEqual(
            await sdb.getData("employeesBatch"),
            await sdb.getData("employeesTest")
        )
    })
    it("should run in batches with a specific batchSize", async () => {
        await sdb.loadData("employeesBatch", "test/data/files/employees.json")
        const run = async (sdb: SimpleDB, originalTable: string) => {
            await sdb.convert(
                originalTable,
                { Salary: "number" },
                { try: true }
            )
            await sdb.addColumn(
                originalTable,
                "Salary2",
                "number",
                `Salary * 2`
            )
        }
        await sdb.batch(run, "employeesBatch", {
            batchSize: 1,
        })

        // To test
        await sdb.loadData("employeesTest", "test/data/files/employees.json")
        await sdb.convert("employeesTest", { Salary: "number" }, { try: true })
        await sdb.addColumn("employeesTest", "Salary2", "number", `Salary * 2`)

        assert.deepStrictEqual(
            await sdb.getData("employeesBatch"),
            await sdb.getData("employeesTest")
        )
    })
    it("should run in batches and output to a new table", async () => {
        await sdb.loadData("employeesBatch", "test/data/files/employees.json")
        const run = async (sdb: SimpleWebDB, originalTable: string) => {
            await sdb.convert(
                originalTable,
                { Salary: "number" },
                { try: true }
            )
            await sdb.addColumn(
                originalTable,
                "Salary2",
                "number",
                `Salary * 2`
            )
        }
        await sdb.batch(run, "employeesBatch", {
            batchSize: 1,
            outputTable: "batchedEmployees",
        })

        // To test
        await sdb.loadData("employeesTest", "test/data/files/employees.json")
        await sdb.convert("employeesTest", { Salary: "number" }, { try: true })
        await sdb.addColumn("employeesTest", "Salary2", "number", `Salary * 2`)

        assert.deepStrictEqual(
            await sdb.getData("batchedEmployees"),
            await sdb.getData("employeesTest")
        )
    })
})
