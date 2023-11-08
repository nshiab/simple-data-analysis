import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("bins", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add a column with the bins and an interval of 10", async () => {
        await simpleNodeDB.loadData("bins", "test/data/files/dataRank.csv")
        const data = await simpleNodeDB.bins("bins", "Mark", 10, "bins", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { Name: "Lily", Subject: "Maths", Mark: 65, bins: "[60-69]" },
            { Name: "Lily", Subject: "Science", Mark: 80, bins: "[80-89]" },
            { Name: "Lily", Subject: "English", Mark: 70, bins: "[70-79]" },
            { Name: "Isabella", Subject: "Maths", Mark: 50, bins: "[50-59]" },
            { Name: "Isabella", Subject: "Science", Mark: 70, bins: "[70-79]" },
            { Name: "Isabella", Subject: "English", Mark: 90, bins: "[90-99]" },
            { Name: "Olivia", Subject: "Maths", Mark: 55, bins: "[50-59]" },
            { Name: "Olivia", Subject: "Science", Mark: 60, bins: "[60-69]" },
            { Name: "Olivia", Subject: "English", Mark: 89, bins: "[80-89]" },
        ])
    })
    it("should add a column with the bins and an interval of 10 and 45 as start value", async () => {
        await simpleNodeDB.loadData("binStart", "test/data/files/dataRank.csv")
        const data = await simpleNodeDB.bins("binStart", "Mark", 10, "bins", {
            startValue: 45,
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { Name: "Lily", Subject: "Maths", Mark: 65, bins: "[65-74]" },
            { Name: "Lily", Subject: "Science", Mark: 80, bins: "[75-84]" },
            { Name: "Lily", Subject: "English", Mark: 70, bins: "[65-74]" },
            { Name: "Isabella", Subject: "Maths", Mark: 50, bins: "[45-54]" },
            { Name: "Isabella", Subject: "Science", Mark: 70, bins: "[65-74]" },
            { Name: "Isabella", Subject: "English", Mark: 90, bins: "[85-94]" },
            { Name: "Olivia", Subject: "Maths", Mark: 55, bins: "[55-64]" },
            { Name: "Olivia", Subject: "Science", Mark: 60, bins: "[55-64]" },
            { Name: "Olivia", Subject: "English", Mark: 89, bins: "[85-94]" },
        ])
    })
    it("should add a column with the bins and an interval of 0.5", async () => {
        await simpleNodeDB.loadData("bin_5", "test/data/files/dataRank.csv")
        const data = await simpleNodeDB.bins("bin_5", "Mark", 0.5, "bins", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { Name: "Lily", Subject: "Maths", Mark: 65, bins: "[65-65.4]" },
            { Name: "Lily", Subject: "Science", Mark: 80, bins: "[80-80.4]" },
            { Name: "Lily", Subject: "English", Mark: 70, bins: "[70-70.4]" },
            { Name: "Isabella", Subject: "Maths", Mark: 50, bins: "[50-50.4]" },
            {
                Name: "Isabella",
                Subject: "Science",
                Mark: 70,
                bins: "[70-70.4]",
            },
            {
                Name: "Isabella",
                Subject: "English",
                Mark: 90,
                bins: "[90-90.4]",
            },
            { Name: "Olivia", Subject: "Maths", Mark: 55, bins: "[55-55.4]" },
            { Name: "Olivia", Subject: "Science", Mark: 60, bins: "[60-60.4]" },
            { Name: "Olivia", Subject: "English", Mark: 89, bins: "[89-89.4]" },
        ])
    })
})
