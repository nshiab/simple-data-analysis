import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("loadDataFromDirectory", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should load data from a directory and return the table", async () => {
        const table = await sdb
            .newTable()
            .loadDataFromDirectory("test/data/directory/", {
                unifyColumns: true,
            })

        assert.deepStrictEqual(table instanceof SimpleTable, true)
    })
    it("should load data from a directory", async () => {
        const table = sdb.newTable()
        await table.loadDataFromDirectory("test/data/directory/", {
            unifyColumns: true,
        })

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un", key3: null },
            { key1: 2, key2: "deux", key3: null },
            { key1: 3, key2: "trois", key3: null },
            { key1: 4, key2: "quatre", key3: null },
            { key1: 5, key2: "cinq", key3: null },
            { key1: 6, key2: "six", key3: null },
            { key1: 7, key2: "sept", key3: null },
            { key1: 8, key2: "huit", key3: null },
            { key1: 9, key2: "neuf", key3: null },
            { key1: 10, key2: "dix", key3: null },
            { key1: 11, key2: "onze", key3: null },
            { key1: 9, key2: "neuf", key3: "nine" },
            { key1: 10, key2: "dix", key3: "ten" },
            { key1: 11, key2: "onze", key3: "eleven" },
        ])
    })
    it("should load data from a directory even when the path doesn't have '/' at the end", async () => {
        const table = sdb.newTable()
        await table.loadDataFromDirectory("test/data/directory", {
            unifyColumns: true,
        })

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un", key3: null },
            { key1: 2, key2: "deux", key3: null },
            { key1: 3, key2: "trois", key3: null },
            { key1: 4, key2: "quatre", key3: null },
            { key1: 5, key2: "cinq", key3: null },
            { key1: 6, key2: "six", key3: null },
            { key1: 7, key2: "sept", key3: null },
            { key1: 8, key2: "huit", key3: null },
            { key1: 9, key2: "neuf", key3: null },
            { key1: 10, key2: "dix", key3: null },
            { key1: 11, key2: "onze", key3: null },
            { key1: 9, key2: "neuf", key3: "nine" },
            { key1: 10, key2: "dix", key3: "ten" },
            { key1: 11, key2: "onze", key3: "eleven" },
        ])
    })
    it("should load data from a directory with a limit option", async () => {
        const table = sdb.newTable()
        await table.loadDataFromDirectory("test/data/directory/", {
            unifyColumns: true,
            limit: 3,
        })

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un", key3: null },
            { key1: 2, key2: "deux", key3: null },
            { key1: 3, key2: "trois", key3: null },
        ])
    })
})
