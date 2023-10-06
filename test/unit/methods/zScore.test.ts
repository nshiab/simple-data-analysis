import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("zScore", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
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
        await simpleNodeDB.cloneTable("people", "peopleThreeDecimals")
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add a column with the zScore", async () => {
        const data = await simpleNodeDB.zScore("people", "age", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { name: "Chloe", age: 33, zScore: -0.42 },
            { name: "Philip", age: 33, zScore: -0.42 },
            { name: "Sonny", age: 57, zScore: 1.25 },
            { name: "Frazer", age: 64, zScore: 1.73 },
            { name: "Sarah", age: 64, zScore: 1.73 },
            { name: "Frankie", age: 65, zScore: 1.8 },
            { name: "Morgan", age: 33, zScore: -0.42 },
            { name: "Jeremy", age: 34, zScore: -0.35 },
            { name: "Claudia", age: 35, zScore: -0.28 },
            { name: "Evangeline", age: 21, zScore: -1.25 },
            { name: "Amelia", age: 29, zScore: -0.69 },
            { name: "Marie", age: 30, zScore: -0.62 },
            { name: "Kiara", age: 31, zScore: -0.55 },
            { name: "Isobel", age: 31, zScore: -0.55 },
            { name: "Genevieve", age: 32, zScore: -0.48 },
            { name: "Jane", age: 32, zScore: -0.48 },
        ])
    })
    it("should add a column with the zScore in a column with a specific name", async () => {
        const data = await simpleNodeDB.zScore("peopleDifferentName", "age", {
            newColumn: "sigma",
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { name: "Chloe", age: 33, sigma: -0.42 },
            { name: "Philip", age: 33, sigma: -0.42 },
            { name: "Sonny", age: 57, sigma: 1.25 },
            { name: "Frazer", age: 64, sigma: 1.73 },
            { name: "Sarah", age: 64, sigma: 1.73 },
            { name: "Frankie", age: 65, sigma: 1.8 },
            { name: "Morgan", age: 33, sigma: -0.42 },
            { name: "Jeremy", age: 34, sigma: -0.35 },
            { name: "Claudia", age: 35, sigma: -0.28 },
            { name: "Evangeline", age: 21, sigma: -1.25 },
            { name: "Amelia", age: 29, sigma: -0.69 },
            { name: "Marie", age: 30, sigma: -0.62 },
            { name: "Kiara", age: 31, sigma: -0.55 },
            { name: "Isobel", age: 31, sigma: -0.55 },
            { name: "Genevieve", age: 32, sigma: -0.48 },
            { name: "Jane", age: 32, sigma: -0.48 },
        ])
    })
    it("should add a column with the zScore in a column with a specific name and 3 decimals", async () => {
        const data = await simpleNodeDB.zScore("peopleThreeDecimals", "age", {
            newColumn: "sigma",
            decimals: 3,
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { name: "Chloe", age: 33, sigma: -0.415 },
            { name: "Philip", age: 33, sigma: -0.415 },
            { name: "Sonny", age: 57, sigma: 1.246 },
            { name: "Frazer", age: 64, sigma: 1.731 },
            { name: "Sarah", age: 64, sigma: 1.731 },
            { name: "Frankie", age: 65, sigma: 1.8 },
            { name: "Morgan", age: 33, sigma: -0.415 },
            { name: "Jeremy", age: 34, sigma: -0.346 },
            { name: "Claudia", age: 35, sigma: -0.277 },
            { name: "Evangeline", age: 21, sigma: -1.246 },
            { name: "Amelia", age: 29, sigma: -0.692 },
            { name: "Marie", age: 30, sigma: -0.623 },
            { name: "Kiara", age: 31, sigma: -0.554 },
            { name: "Isobel", age: 31, sigma: -0.554 },
            { name: "Genevieve", age: 32, sigma: -0.485 },
            { name: "Jane", age: 32, sigma: -0.485 },
        ])
    })
})
