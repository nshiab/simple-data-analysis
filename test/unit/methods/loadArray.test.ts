import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("loadArray", () => {
    let simpleNodeDB: SimpleNodeDB
    const arrayOfObjects = [
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
    ]

    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should load an array of objects into a table", async () => {
        await simpleNodeDB.loadArray("arrayOfObjects", arrayOfObjects)

        const data = await simpleNodeDB.getData("arrayOfObjects")

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
