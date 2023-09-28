import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("sort", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("dataSort", "test/data/files/dataSort.csv")
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should sort one number column ascendingly", async () => {
        const data = await simpleNodeDB.sort(
            "dataSort",
            { key1: "asc" },
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "Roi", key3: "A" },
            { key1: 2, key2: "Alambic", key3: "B" },
            { key1: 4, key2: "Extérieur", key3: "B" },
            { key1: 5, key2: "À l'ouest", key3: "A" },
            { key1: 56.7, key2: "Éléphant", key3: "A" },
            { key1: 900, key2: "Zéphir", key3: "A" },
        ])
    })

    it("should sort one number column descendingly", async () => {
        const data = await simpleNodeDB.sort(
            "dataSort",
            { key1: "desc" },
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: 900, key2: "Zéphir", key3: "A" },
            { key1: 56.7, key2: "Éléphant", key3: "A" },
            { key1: 5, key2: "À l'ouest", key3: "A" },
            { key1: 4, key2: "Extérieur", key3: "B" },
            { key1: 2, key2: "Alambic", key3: "B" },
            { key1: 1, key2: "Roi", key3: "A" },
        ])
    })

    it("should sort one text column ascendingly with a specific language", async () => {
        const data = await simpleNodeDB.sort(
            "dataSort",
            { key2: "asc" },
            {
                lang: { key2: "fr" },
                returnDataFrom: "table",
            }
        )
        assert.deepStrictEqual(data, [
            { key1: 5, key2: "À l'ouest", key3: "A" },
            { key1: 2, key2: "Alambic", key3: "B" },
            { key1: 56.7, key2: "Éléphant", key3: "A" },
            { key1: 4, key2: "Extérieur", key3: "B" },
            { key1: 1, key2: "Roi", key3: "A" },
            { key1: 900, key2: "Zéphir", key3: "A" },
        ])
    })
    it("should sort one text column descendingly with a specific language", async () => {
        const data = await simpleNodeDB.sort(
            "dataSort",
            { key2: "desc" },
            {
                lang: { key2: "fr" },
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: 900, key2: "Zéphir", key3: "A" },
            { key1: 1, key2: "Roi", key3: "A" },
            { key1: 4, key2: "Extérieur", key3: "B" },
            { key1: 56.7, key2: "Éléphant", key3: "A" },
            { key1: 2, key2: "Alambic", key3: "B" },
            { key1: 5, key2: "À l'ouest", key3: "A" },
        ])
    })
    it("should sort mutiple columns ascendingly or descendingly with a specific language", async () => {
        const data = await simpleNodeDB.sort(
            "dataSort",
            { key3: "asc", key1: "desc" },
            {
                lang: { key2: "fr" },
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: 900, key2: "Zéphir", key3: "A" },
            { key1: 56.7, key2: "Éléphant", key3: "A" },
            { key1: 5, key2: "À l'ouest", key3: "A" },
            { key1: 1, key2: "Roi", key3: "A" },
            { key1: 4, key2: "Extérieur", key3: "B" },
            { key1: 2, key2: "Alambic", key3: "B" },
        ])
    })
})
