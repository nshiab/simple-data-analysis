import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("quantiles", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should add a column with the quantiles", async () => {
        await sdb.loadData("quantiles", "test/data/files/dataRank.csv")
        await sdb.quantiles("quantiles", "Mark", 4, "quantiles")
        const data = await sdb.getData("quantiles")

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
        await sdb.loadData("quantilesGrouped", "test/data/files/dataRank.csv")
        await sdb.quantiles("quantilesGrouped", "Mark", 2, "quantiles", {
            categories: "Subject",
        })

        await sdb.sort("quantilesGrouped", {
            Subject: "asc",
            Mark: "asc",
        })

        const data = await sdb.getData("quantilesGrouped")

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
