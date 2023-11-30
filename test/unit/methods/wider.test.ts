import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("wider", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("dataTidy", "test/data/files/dataTidy.json")
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should untidy data by expanding mutiple columns", async () => {
        await simpleNodeDB.wider("dataTidy", "year", "employees")

        await simpleNodeDB.sort("dataTidy", { Department: "asc" })
        const data = await simpleNodeDB.getData("dataTidy")

        assert.deepStrictEqual(data, [
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
                "2015": 1,
                "2016": 2,
                "2017": 5,
                "2018": 2,
                "2019": 2,
                "2020": 3,
                Department: "R&D",
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
