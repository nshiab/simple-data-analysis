import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("fill", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should fill empty cells for one column", async () => {
        const table = await sdb
            .newTable()
            .loadArray([
                { first: "Nael" },
                { first: null },
                { first: null },
                { first: "Graeme" },
                { first: null },
                { first: null },
                { first: null },
                { first: null },
                { first: "Andrew" },
            ])
        await table.fill("first")
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            { first: "Nael" },
            { first: "Nael" },
            { first: "Nael" },
            { first: "Graeme" },
            { first: "Graeme" },
            { first: "Graeme" },
            { first: "Graeme" },
            { first: "Graeme" },
            { first: "Andrew" },
        ])
    })
    it("should fill empty cells for multiple columns", async () => {
        const table = await sdb.newTable().loadArray([
            { first: "Nael", job: "Senior producer" },
            { first: null, job: null },
            { first: null, job: "Senior producer" },
            { first: "Graeme", job: "Producer" },
            { first: null, job: null },
            { first: null, job: "Super producer" },
            { first: null, job: null },
            { first: null, job: null },
            { first: "Andrew", job: "Senior dev" },
        ])
        await table.fill(["first", "job"])
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            { first: "Nael", job: "Senior producer" },
            { first: "Nael", job: "Senior producer" },
            { first: "Nael", job: "Senior producer" },
            { first: "Graeme", job: "Producer" },
            { first: "Graeme", job: "Producer" },
            { first: "Graeme", job: "Super producer" },
            { first: "Graeme", job: "Super producer" },
            { first: "Graeme", job: "Super producer" },
            { first: "Andrew", job: "Senior dev" },
        ])
    })
})
