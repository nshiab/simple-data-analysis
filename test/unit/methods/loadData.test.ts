import assert from "assert"
import { SimpleDB } from "../../../src/index.js"

describe("loadData()", function () {
    const simpleDB = new SimpleDB()

    it("should load data from an array of objects", async function () {
        const data = [{ key1: 1, key2: 2 }]
        await simpleDB.start()
        await simpleDB.loadData("employeesJSON", data)

        assert.deepStrictEqual(data, await simpleDB.getData("employeesJSON"))
        await simpleDB.stop()
    })
})
