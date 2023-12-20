import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("batch", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should run in batches", async () => {
        await simpleNodeDB.loadData(
            "employeesBatch",
            "test/data/files/employees.json"
        )
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
        await simpleNodeDB.batch(run, "employeesBatch")

        // To test
        await simpleNodeDB.loadData(
            "employeesTest",
            "test/data/files/employees.json"
        )
        await simpleNodeDB.convert(
            "employeesTest",
            { Salary: "number" },
            { try: true }
        )
        await simpleNodeDB.addColumn(
            "employeesTest",
            "Salary2",
            "number",
            `Salary * 2`
        )

        assert.deepStrictEqual(
            await simpleNodeDB.getData("employeesBatch"),
            await simpleNodeDB.getData("employeesTest")
        )
    })
    it("should run in batches with a specific batchSize", async () => {
        await simpleNodeDB.loadData(
            "employeesBatch",
            "test/data/files/employees.json"
        )
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
        await simpleNodeDB.batch(run, "employeesBatch", {
            batchSize: 1,
        })

        // To test
        await simpleNodeDB.loadData(
            "employeesTest",
            "test/data/files/employees.json"
        )
        await simpleNodeDB.convert(
            "employeesTest",
            { Salary: "number" },
            { try: true }
        )
        await simpleNodeDB.addColumn(
            "employeesTest",
            "Salary2",
            "number",
            `Salary * 2`
        )

        assert.deepStrictEqual(
            await simpleNodeDB.getData("employeesBatch"),
            await simpleNodeDB.getData("employeesTest")
        )
    })
    it("should run in batches and output to a new table", async () => {
        await simpleNodeDB.loadData(
            "employeesBatch",
            "test/data/files/employees.json"
        )
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
        await simpleNodeDB.batch(run, "employeesBatch", {
            batchSize: 1,
            outputTable: "batchedEmployees",
        })

        // To test
        await simpleNodeDB.loadData(
            "employeesTest",
            "test/data/files/employees.json"
        )
        await simpleNodeDB.convert(
            "employeesTest",
            { Salary: "number" },
            { try: true }
        )
        await simpleNodeDB.addColumn(
            "employeesTest",
            "Salary2",
            "number",
            `Salary * 2`
        )

        assert.deepStrictEqual(
            await simpleNodeDB.getData("batchedEmployees"),
            await simpleNodeDB.getData("employeesTest")
        )
    })
})
