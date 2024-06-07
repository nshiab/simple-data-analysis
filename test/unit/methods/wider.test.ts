import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("wider", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should untidy data by expanding mutiple columns", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataTidy.json")
        await table.wider("year", "employees")

        await table.sort({ Department: "asc" })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                "2015": 1,
                "2016": 2,
                "2017": 5,
                "2018": 2,
                "2019": 2,
                "2020": 3,
                Department: "R&D",
            },
            {
                "2015": 10,
                "2016": 9,
                "2017": 15,
                "2018": 11,
                "2019": 25,
                "2020": 32,
                Department: "accounting",
            },
            {
                "2015": 2,
                "2016": 7,
                "2017": 15,
                "2018": 32,
                "2019": 45,
                "2020": 27,
                Department: "sales",
            },
        ])
    })
})
