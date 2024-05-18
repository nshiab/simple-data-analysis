import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getLength", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadArray("age", [
            { name: "Evangeline", age: 21 },
            { name: "Amelia", age: 29 },
            { name: "Marie", age: 30 },
            { name: "Kiara", age: 31 },
            { name: "Isobel", age: 31 },
            { name: "Genevieve", age: 32 },
            { name: "Jane", age: 32 },
            { name: "Chloe", age: 33 },
            { name: "Philip", age: 33 },
            { name: "Morgan", age: 33 },
            { name: "Jeremy", age: 34 },
            { name: "Claudia", age: 35 },
            { name: "Sonny", age: 57 },
            { name: "Frazer", age: 64 },
            { name: "Sarah", age: 64 },
            { name: "Frankie", age: 65 },
        ])
        await sdb.loadArray("ageWithNull", [
            { name: "Evangeline", age: 21 },
            { name: "Amelia", age: 29 },
            { name: "Marie", age: 30 },
            { name: null, age: null },
            { name: "Isobel", age: 31 },
            { name: "Genevieve", age: 32 },
            { name: "Jane", age: 32 },
            { name: "Chloe", age: 33 },
            { name: "Philip", age: 33 },
            { name: "Morgan", age: 33 },
            { name: "Jeremy", age: 34 },
            { name: "Claudia", age: 35 },
            { name: "Sonny", age: 57 },
            { name: "Frazer", age: 64 },
            { name: "Sarah", age: 64 },
            { name: "Frankie", age: 65 },
        ])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the number of a rows in a table", async () => {
        const length = await sdb.getLength("age")

        assert.deepStrictEqual(length, 16)
    })
    it("should return the number of a rows in a table with nul values", async () => {
        const length = await sdb.getLength("ageWithNull")

        assert.deepStrictEqual(length, 16)
    })
})
