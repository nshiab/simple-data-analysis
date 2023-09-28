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

    it("should sort one number column ascendingly", async () => {
        const data = await simpleNodeDB.tidy(
            "dataUntidy",
            ["2015", "2016", "2017", "2018", "2019", "2020"],
            "year",
            "employees",
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { Departement: "accounting", year: "2015", employees: 10 },
            { Departement: "accounting", year: "2016", employees: 9 },
            { Departement: "accounting", year: "2017", employees: 15 },
            { Departement: "accounting", year: "2018", employees: 11 },
            { Departement: "accounting", year: "2019", employees: 25 },
            { Departement: "accounting", year: "2020", employees: 32 },
            { Departement: "R&D", year: "2015", employees: 1 },
            { Departement: "R&D", year: "2016", employees: 2 },
            { Departement: "R&D", year: "2017", employees: 5 },
            { Departement: "R&D", year: "2018", employees: 2 },
            { Departement: "R&D", year: "2019", employees: 2 },
            { Departement: "R&D", year: "2020", employees: 3 },
            { Departement: "sales", year: "2015", employees: 2 },
            { Departement: "sales", year: "2016", employees: 7 },
            { Departement: "sales", year: "2017", employees: 15 },
            { Departement: "sales", year: "2018", employees: 32 },
            { Departement: "sales", year: "2019", employees: 45 },
            { Departement: "sales", year: "2020", employees: 27 },
        ])
    })
})
