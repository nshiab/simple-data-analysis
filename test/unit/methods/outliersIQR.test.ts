import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("outliersIQR", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadArray("people", [
            { name: "Chloe", age: 33 },
            { name: "Philip", age: 33 },
            { name: "Sonny", age: 57 },
            { name: "Frazer", age: 64 },
            { name: "Sarah", age: 64 },
            { name: "Frankie", age: 65 },
            { name: "Morgan", age: 33 },
            { name: "Jeremy", age: 34 },
            { name: "Claudia", age: 35 },
            { name: "Evangeline", age: 21 },
            { name: "Amelia", age: 29 },
            { name: "Marie", age: 30 },
            { name: "Kiara", age: 31 },
            { name: "Isobel", age: 31 },
            { name: "Genevieve", age: 32 },
            { name: "Jane", age: 32 },
        ])
        await simpleNodeDB.cloneTable("people", "peopleDifferentName")
        await simpleNodeDB.loadArray("peopleOdd", [
            { name: "Chloe", age: 33 },
            { name: "Philip", age: 33 },
            { name: "Sonny", age: 57 },
            { name: "Frazer", age: 64 },
            { name: "Sarah", age: 64 },
            { name: "Frankie", age: 65 },
            { name: "Morgan", age: 33 },
            { name: "Helen", age: 20 },
            { name: "Jeremy", age: 34 },
            { name: "Claudia", age: 35 },
            { name: "Evangeline", age: 21 },
            { name: "Amelia", age: 29 },
            { name: "Marie", age: 30 },
            { name: "Kiara", age: 31 },
            { name: "Isobel", age: 31 },
            { name: "Genevieve", age: 32 },
            { name: "Jane", age: 32 },
        ])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add an outliers column based on the IQR method with an even number of rows", async () => {
        // comparing against https://dataschool.com/how-to-teach-people-sql/how-to-find-outliers-with-sql/

        const data = await simpleNodeDB.outliersIQR(
            "people",
            "age",
            "ageOutliers",
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { name: "Chloe", age: 33, ageOutliers: false },
            { name: "Philip", age: 33, ageOutliers: false },
            { name: "Sonny", age: 57, ageOutliers: true },
            { name: "Frazer", age: 64, ageOutliers: true },
            { name: "Sarah", age: 64, ageOutliers: true },
            { name: "Frankie", age: 65, ageOutliers: true },
            { name: "Morgan", age: 33, ageOutliers: false },
            { name: "Jeremy", age: 34, ageOutliers: false },
            { name: "Claudia", age: 35, ageOutliers: false },
            { name: "Evangeline", age: 21, ageOutliers: true },
            { name: "Amelia", age: 29, ageOutliers: false },
            { name: "Marie", age: 30, ageOutliers: false },
            { name: "Kiara", age: 31, ageOutliers: false },
            { name: "Isobel", age: 31, ageOutliers: false },
            { name: "Genevieve", age: 32, ageOutliers: false },
            { name: "Jane", age: 32, ageOutliers: false },
        ])
    })

    it("should add an outliers column based on the IQR method with an even number of rows", async () => {
        // comparing against https://dataschool.com/how-to-teach-people-sql/how-to-find-outliers-with-sql/

        const data = await simpleNodeDB.outliersIQR(
            "peopleOdd",
            "age",
            "ageOutliers",
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { name: "Chloe", age: 33, ageOutliers: false },
            { name: "Philip", age: 33, ageOutliers: false },
            { name: "Sonny", age: 57, ageOutliers: true },
            { name: "Frazer", age: 64, ageOutliers: true },
            { name: "Sarah", age: 64, ageOutliers: true },
            { name: "Frankie", age: 65, ageOutliers: true },
            { name: "Morgan", age: 33, ageOutliers: false },
            { name: "Helen", age: 20, ageOutliers: true },
            { name: "Jeremy", age: 34, ageOutliers: false },
            { name: "Claudia", age: 35, ageOutliers: false },
            { name: "Evangeline", age: 21, ageOutliers: true },
            { name: "Amelia", age: 29, ageOutliers: false },
            { name: "Marie", age: 30, ageOutliers: false },
            { name: "Kiara", age: 31, ageOutliers: false },
            { name: "Isobel", age: 31, ageOutliers: false },
            { name: "Genevieve", age: 32, ageOutliers: false },
            { name: "Jane", age: 32, ageOutliers: false },
        ])
    })
})
