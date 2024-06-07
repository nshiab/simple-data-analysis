import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("longer", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should tidy data by stacking mutiple columns", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataUntidy.json")
        await table.longer(
            ["2015", "2016", "2017", "2018", "2019", "2020"],
            "year",
            "employees"
        )

        const data = await table.getData()
        assert.deepStrictEqual(data, [
            { Department: "accounting", year: "2015", employees: 10 },
            { Department: "accounting", year: "2016", employees: 9 },
            { Department: "accounting", year: "2017", employees: 15 },
            { Department: "accounting", year: "2018", employees: 11 },
            { Department: "accounting", year: "2019", employees: 25 },
            { Department: "accounting", year: "2020", employees: 32 },
            { Department: "R&D", year: "2015", employees: 1 },
            { Department: "R&D", year: "2016", employees: 2 },
            { Department: "R&D", year: "2017", employees: 5 },
            { Department: "R&D", year: "2018", employees: 2 },
            { Department: "R&D", year: "2019", employees: 2 },
            { Department: "R&D", year: "2020", employees: 3 },
            { Department: "sales", year: "2015", employees: 2 },
            { Department: "sales", year: "2016", employees: 7 },
            { Department: "sales", year: "2017", employees: 15 },
            { Department: "sales", year: "2018", employees: 32 },
            { Department: "sales", year: "2019", employees: 45 },
            { Department: "sales", year: "2020", employees: 27 },
        ])
    })
    it("should tidy data by stacking mutiple columns and by including null values", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataUntidyWithNulls.json")
        await table.longer(
            ["2015", "2016", "2017", "2018", "2019", "2020"],
            "year",
            "employees"
        )

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { Department: "accounting", year: "2015", employees: null },
            { Department: "accounting", year: "2016", employees: 9 },
            { Department: "accounting", year: "2017", employees: 15 },
            { Department: "accounting", year: "2018", employees: 11 },
            { Department: "accounting", year: "2019", employees: 25 },
            { Department: "accounting", year: "2020", employees: 32 },
            { Department: "R&D", year: "2015", employees: 1 },
            { Department: "R&D", year: "2016", employees: 2 },
            { Department: "R&D", year: "2017", employees: null },
            { Department: "R&D", year: "2018", employees: 2 },
            { Department: "R&D", year: "2019", employees: 2 },
            { Department: "R&D", year: "2020", employees: 3 },
            { Department: "sales", year: "2015", employees: 2 },
            { Department: "sales", year: "2016", employees: 7 },
            { Department: "sales", year: "2017", employees: 15 },
            { Department: "sales", year: "2018", employees: 32 },
            { Department: "sales", year: "2019", employees: 45 },
            { Department: "sales", year: "2020", employees: null },
        ])
    })
})
