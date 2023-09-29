import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("tidy", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData(
            "dataUntidy",
            "test/data/files/dataUntidy.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should tidy data by stacking mutiple columns", async () => {
        const data = await simpleNodeDB.tidy(
            "dataUntidy",
            ["2015", "2016", "2017", "2018", "2019", "2020"],
            "year",
            "employees",
            { returnDataFrom: "table" }
        )

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
})
