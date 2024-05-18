import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("wider", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("dataTidy", "test/data/files/dataTidy.json")
    })
    after(async function () {
        await sdb.done()
    })

    it("should untidy data by expanding mutiple columns", async () => {
        await sdb.wider("dataTidy", "year", "employees")

        await sdb.sort("dataTidy", { Department: "asc" })
        const data = await sdb.getData("dataTidy")

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
