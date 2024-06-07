import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("loadArray", () => {
    let sdb: SimpleDB

    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should load an array of objects into a table", async () => {
        const table = sdb.newTable()
        await table.loadArray([
            {
                key1: 1,
                key2: "un",
                key3: new Date("2010-01-01"),
                key4: true,
            },
            {
                key1: NaN,
                key2: "deux",
                key3: new Date("2010-01-02"),
                key4: null,
            },
            {
                key1: 3,
                key2: undefined,
                key3: new Date("2010-01-03"),
                key4: false,
            },
            {
                key1: 4,
                key2: "quatre",
                key3: new Date("2010-01-04"),
                key4: false,
            },
        ])

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un", key3: new Date("2010-01-01"), key4: true },
            {
                key1: NaN,
                key2: "deux",
                key3: new Date("2010-01-02"),
                key4: null,
            },
            { key1: 3, key2: "", key3: new Date("2010-01-03"), key4: false },
            {
                key1: 4,
                key2: "quatre",
                key3: new Date("2010-01-04"),
                key4: false,
            },
        ])
    })
})
