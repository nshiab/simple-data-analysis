import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("quantiles", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add a column with the quantiles", async () => {
        await simpleNodeDB.loadData("quantiles", "test/data/files/dataRank.csv")
        const data = await simpleNodeDB.quantiles(
            "quantiles",
            "Mark",
            4,
            "quantiles",
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { Name: "Isabella", Subject: "Maths", Mark: 50, quantiles: 1 },
            { Name: "Olivia", Subject: "Maths", Mark: 55, quantiles: 1 },
            { Name: "Olivia", Subject: "Science", Mark: 60, quantiles: 1 },
            { Name: "Lily", Subject: "Maths", Mark: 65, quantiles: 2 },
            { Name: "Lily", Subject: "English", Mark: 70, quantiles: 2 },
            { Name: "Isabella", Subject: "Science", Mark: 70, quantiles: 3 },
            { Name: "Lily", Subject: "Science", Mark: 80, quantiles: 3 },
            { Name: "Olivia", Subject: "English", Mark: 89, quantiles: 4 },
            { Name: "Isabella", Subject: "English", Mark: 90, quantiles: 4 },
        ])
    })

    it("should add a column with the quantiles after grouping", async () => {
        await simpleNodeDB.loadData(
            "quantilesGrouped",
            "test/data/files/dataRank.csv"
        )
        const data = await simpleNodeDB.quantiles(
            "quantilesGrouped",
            "Mark",
            2,
            "quantiles",
            {
                categories: "Subject",
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { Name: "Lily", Subject: "English", Mark: 70, quantiles: 1 },
            { Name: "Olivia", Subject: "English", Mark: 89, quantiles: 1 },
            { Name: "Isabella", Subject: "English", Mark: 90, quantiles: 2 },
            { Name: "Isabella", Subject: "Maths", Mark: 50, quantiles: 1 },
            { Name: "Olivia", Subject: "Maths", Mark: 55, quantiles: 1 },
            { Name: "Lily", Subject: "Maths", Mark: 65, quantiles: 2 },
            { Name: "Olivia", Subject: "Science", Mark: 60, quantiles: 1 },
            { Name: "Isabella", Subject: "Science", Mark: 70, quantiles: 1 },
            { Name: "Lily", Subject: "Science", Mark: 80, quantiles: 2 },
        ])
    })
})
