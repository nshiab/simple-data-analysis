import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("updateWithJS", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should update the data from the table with a javascript function and reinsert it into the table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/employees.json")
        await table.updateWithJS((rows) => {
            const modifiedRows = rows.map((d) => ({
                Name: typeof d.Name === "string" ? d.Name.slice(0, 4) : d.Name,
            }))

            return modifiedRows
        })

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { Name: "OCon" },
            { Name: "OCon" },
            { Name: "Gran" },
            { Name: null },
            { Name: "Hart" },
            { Name: "Fay," },
            { Name: "Mavr" },
            { Name: null },
            { Name: "Higg" },
            { Name: null },
            { Name: "King" },
            { Name: "Koch" },
            { Name: "De H" },
            { Name: "Huno" },
            { Name: "Erns" },
            { Name: "Aust" },
            { Name: "Pata" },
            { Name: "Lore" },
            { Name: "Gree" },
            { Name: "Favi" },
            { Name: "Chen" },
            { Name: "Scia" },
            { Name: "Urma" },
            { Name: "Popp" },
            { Name: "Raph" },
            { Name: "Khoo" },
            { Name: "Baid" },
            { Name: "Tobi" },
            { Name: "Himu" },
            { Name: "Colm" },
            { Name: "Weis" },
            { Name: "Frip" },
            { Name: "Kauf" },
            { Name: "Voll" },
            { Name: "Mour" },
            { Name: "Naye" },
            { Name: "Mikk" },
            { Name: "Land" },
            { Name: "Mark" },
            { Name: "Biss" },
            { Name: "Atki" },
            { Name: "Marl" },
            { Name: "Olso" },
            { Name: null },
            { Name: "Roge" },
            { Name: "Gee," },
            { Name: "Phil" },
            { Name: "Ladw" },
            { Name: "Stil" },
            { Name: "Seo," },
            { Name: "Pate" },
        ])
    })
})
