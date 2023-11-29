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
        await simpleNodeDB.loadArray("peopleGender", [
            { name: "Chloe", age: 33, gender: "Woman" },
            { name: "Philip", age: 125, gender: "Man" },
            { name: "Sonny", age: 57, gender: "Man" },
            { name: "Frazer", age: 64, gender: "Man" },
            { name: "Sarah", age: 64, gender: "Woman" },
            { name: "Frankie", age: 65, gender: "Woman" },
            { name: "Morgan", age: 33, gender: "Woman" },
            { name: "Helen", age: 20, gender: "Woman" },
            { name: "Jeremy", age: 34, gender: "Man" },
            { name: "Claudia", age: 35, gender: "Woman" },
            { name: "Evangeline", age: 21, gender: "Woman" },
            { name: "Amelia", age: 29, gender: "Woman" },
            { name: "Marie", age: 30, gender: "Woman" },
            { name: "Kiara", age: 31, gender: "Woman" },
            { name: "Isobel", age: 31, gender: "Woman" },
            { name: "Genevieve", age: 3, gender: "Woman" },
            { name: "Jane", age: 32, gender: "Woman" },
        ])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add an outliers column based on the IQR method with an even number of rows", async () => {
        // comparing against https://dataschool.com/how-to-teach-people-sql/how-to-find-outliers-with-sql/

        await simpleNodeDB.outliersIQR("people", "age", "ageOutliers")
        const data = await simpleNodeDB.sort(
            "people",
            {
                ageOutliers: "desc",
                age: "asc",
            },
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { name: "Evangeline", age: 21, ageOutliers: true },
            { name: "Sonny", age: 57, ageOutliers: true },
            { name: "Frazer", age: 64, ageOutliers: true },
            { name: "Sarah", age: 64, ageOutliers: true },
            { name: "Frankie", age: 65, ageOutliers: true },
            { name: "Amelia", age: 29, ageOutliers: false },
            { name: "Marie", age: 30, ageOutliers: false },
            { name: "Kiara", age: 31, ageOutliers: false },
            { name: "Isobel", age: 31, ageOutliers: false },
            { name: "Genevieve", age: 32, ageOutliers: false },
            { name: "Jane", age: 32, ageOutliers: false },
            { name: "Chloe", age: 33, ageOutliers: false },
            { name: "Philip", age: 33, ageOutliers: false },
            { name: "Morgan", age: 33, ageOutliers: false },
            { name: "Jeremy", age: 34, ageOutliers: false },
            { name: "Claudia", age: 35, ageOutliers: false },
        ])
    })
    it("should add an outliers column based on the IQR method with an even number of rows", async () => {
        // comparing against https://dataschool.com/how-to-teach-people-sql/how-to-find-outliers-with-sql/

        await simpleNodeDB.outliersIQR("peopleOdd", "age", "ageOutliers")

        const data = await simpleNodeDB.sort(
            "peopleOdd",
            {
                ageOutliers: "desc",
                age: "asc",
            },
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { name: "Helen", age: 20, ageOutliers: true },
            { name: "Evangeline", age: 21, ageOutliers: true },
            { name: "Sonny", age: 57, ageOutliers: true },
            { name: "Frazer", age: 64, ageOutliers: true },
            { name: "Sarah", age: 64, ageOutliers: true },
            { name: "Frankie", age: 65, ageOutliers: true },
            { name: "Amelia", age: 29, ageOutliers: false },
            { name: "Marie", age: 30, ageOutliers: false },
            { name: "Kiara", age: 31, ageOutliers: false },
            { name: "Isobel", age: 31, ageOutliers: false },
            { name: "Genevieve", age: 32, ageOutliers: false },
            { name: "Jane", age: 32, ageOutliers: false },
            { name: "Chloe", age: 33, ageOutliers: false },
            { name: "Philip", age: 33, ageOutliers: false },
            { name: "Morgan", age: 33, ageOutliers: false },
            { name: "Jeremy", age: 34, ageOutliers: false },
            { name: "Claudia", age: 35, ageOutliers: false },
        ])
    })
    it("should add an outliers column based on the IQR method with an even number of rows and with a category", async () => {
        await simpleNodeDB.outliersIQR("peopleGender", "age", "ageOutliers", {
            categories: "gender",
        })
        const data = await simpleNodeDB.sort(
            "peopleGender",
            {
                gender: "asc",
                ageOutliers: "desc",
                age: "asc",
            },
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { name: "Philip", age: 125, gender: "Man", ageOutliers: true },
            { name: "Jeremy", age: 34, gender: "Man", ageOutliers: false },
            { name: "Sonny", age: 57, gender: "Man", ageOutliers: false },
            { name: "Frazer", age: 64, gender: "Man", ageOutliers: false },
            { name: "Genevieve", age: 3, gender: "Woman", ageOutliers: true },
            { name: "Helen", age: 20, gender: "Woman", ageOutliers: true },
            { name: "Evangeline", age: 21, gender: "Woman", ageOutliers: true },
            { name: "Sarah", age: 64, gender: "Woman", ageOutliers: true },
            { name: "Frankie", age: 65, gender: "Woman", ageOutliers: true },
            { name: "Amelia", age: 29, gender: "Woman", ageOutliers: false },
            { name: "Marie", age: 30, gender: "Woman", ageOutliers: false },
            { name: "Kiara", age: 31, gender: "Woman", ageOutliers: false },
            { name: "Isobel", age: 31, gender: "Woman", ageOutliers: false },
            { name: "Jane", age: 32, gender: "Woman", ageOutliers: false },
            { name: "Chloe", age: 33, gender: "Woman", ageOutliers: false },
            { name: "Morgan", age: 33, gender: "Woman", ageOutliers: false },
            { name: "Claudia", age: 35, gender: "Woman", ageOutliers: false },
        ])
    })
})
