import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

// Based on https://www.sqlshack.com/overview-of-sql-rank-functions/

describe("ranks", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add a column with the rank", async () => {
        await simpleNodeDB.loadData(
            "normalRank",
            "test/data/files/dataRank.csv"
        )
        await simpleNodeDB.ranks("normalRank", "Mark", "rank")
        const data = await simpleNodeDB.getData("normalRank")
        assert.deepStrictEqual(data, [
            { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
            { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 2 },
            { Name: "Olivia", Subject: "Science", Mark: 60, rank: 3 },
            { Name: "Lily", Subject: "Maths", Mark: 65, rank: 4 },
            { Name: "Lily", Subject: "English", Mark: 70, rank: 5 },
            { Name: "Isabella", Subject: "Science", Mark: 70, rank: 5 },
            { Name: "Lily", Subject: "Science", Mark: 80, rank: 7 },
            { Name: "Olivia", Subject: "English", Mark: 89, rank: 8 },
            { Name: "Isabella", Subject: "English", Mark: 90, rank: 9 },
        ])
    })
    it("should add a column with the rank and no gaps", async () => {
        await simpleNodeDB.loadData("denseRank", "test/data/files/dataRank.csv")
        await simpleNodeDB.ranks("denseRank", "Mark", "rank", {
            noGaps: true,
        })
        const data = await simpleNodeDB.getData("denseRank")

        assert.deepStrictEqual(data, [
            { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
            { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 2 },
            { Name: "Olivia", Subject: "Science", Mark: 60, rank: 3 },
            { Name: "Lily", Subject: "Maths", Mark: 65, rank: 4 },
            { Name: "Lily", Subject: "English", Mark: 70, rank: 5 },
            { Name: "Isabella", Subject: "Science", Mark: 70, rank: 5 },
            { Name: "Lily", Subject: "Science", Mark: 80, rank: 6 },
            { Name: "Olivia", Subject: "English", Mark: 89, rank: 7 },
            { Name: "Isabella", Subject: "English", Mark: 90, rank: 8 },
        ])
    })
    it("should add a column with the rank after grouping with one category", async () => {
        await simpleNodeDB.loadData(
            "groupedRegularRank",
            "test/data/files/dataRank.csv"
        )
        await simpleNodeDB.ranks("groupedRegularRank", "Mark", "rank", {
            categories: "Subject",
        })
        await simpleNodeDB.sort("groupedRegularRank", {
            Subject: "asc",
            Mark: "asc",
        })
        const data = await simpleNodeDB.getData("groupedRegularRank")
        assert.deepStrictEqual(data, [
            { Name: "Lily", Subject: "English", Mark: 70, rank: 1 },
            { Name: "Olivia", Subject: "English", Mark: 89, rank: 2 },
            { Name: "Isabella", Subject: "English", Mark: 90, rank: 3 },
            { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
            { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 2 },
            { Name: "Lily", Subject: "Maths", Mark: 65, rank: 3 },
            { Name: "Olivia", Subject: "Science", Mark: 60, rank: 1 },
            { Name: "Isabella", Subject: "Science", Mark: 70, rank: 2 },
            { Name: "Lily", Subject: "Science", Mark: 80, rank: 3 },
        ])
    })
    it("should add a column with the rank after grouping with multiple categories", async () => {
        await simpleNodeDB.loadData(
            "multipleGroupedRegularRank",
            "test/data/files/dataRank.csv"
        )
        await simpleNodeDB.ranks("multipleGroupedRegularRank", "Mark", "rank", {
            categories: ["Name", "Subject"],
        })

        await simpleNodeDB.sort("multipleGroupedRegularRank", {
            Name: "asc",
            Subject: "asc",
            Mark: "asc",
        })

        const data = await simpleNodeDB.getData("multipleGroupedRegularRank")

        assert.deepStrictEqual(data, [
            { Name: "Isabella", Subject: "English", Mark: 90, rank: 1 },
            { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
            { Name: "Isabella", Subject: "Science", Mark: 70, rank: 1 },
            { Name: "Lily", Subject: "English", Mark: 70, rank: 1 },
            { Name: "Lily", Subject: "Maths", Mark: 65, rank: 1 },
            { Name: "Lily", Subject: "Science", Mark: 80, rank: 1 },
            { Name: "Olivia", Subject: "English", Mark: 89, rank: 1 },
            { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 1 },
            { Name: "Olivia", Subject: "Science", Mark: 60, rank: 1 },
        ])
    })
})
