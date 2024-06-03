import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("perimeter", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should calculate the perimeter of geometries in meters", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.flipCoordinates("geom")
        await table.perimeter("geom", "perim")
        await table.round("perim")
        await table.selectColumns(["nameEnglish", "perim"])
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { nameEnglish: "Newfoundland and Labrador", perim: 6924550 },
            { nameEnglish: "Prince Edward Island", perim: 492387 },
            { nameEnglish: "Nova Scotia", perim: 1713715 },
            { nameEnglish: "New Brunswick", perim: 1299566 },
            { nameEnglish: "Quebec", perim: 10533664 },
            { nameEnglish: "Ontario", perim: 6782774 },
            { nameEnglish: "Manitoba", perim: 3751609 },
            { nameEnglish: "Saskatchewan", perim: 3529235 },
            { nameEnglish: "Alberta", perim: 3525562 },
            { nameEnglish: "British Columbia", perim: 7431794 },
            { nameEnglish: "Yukon", perim: 3743373 },
            { nameEnglish: "Northwest Territories", perim: 11134550 },
            { nameEnglish: "Nunavut", perim: 33718590 },
        ])
    })
    it("should calculate the perimeter of geometries in meters with a file loaded with option toWGS84", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json",
            { toWGS84: true }
        )
        // No need to flip
        // await table.flipCoordinates("geom")
        await table.perimeter("geom", "perim")
        await table.round("perim")
        await table.selectColumns(["nameEnglish", "perim"])
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { nameEnglish: "Newfoundland and Labrador", perim: 6924550 },
            { nameEnglish: "Prince Edward Island", perim: 492387 },
            { nameEnglish: "Nova Scotia", perim: 1713715 },
            { nameEnglish: "New Brunswick", perim: 1299566 },
            { nameEnglish: "Quebec", perim: 10533664 },
            { nameEnglish: "Ontario", perim: 6782774 },
            { nameEnglish: "Manitoba", perim: 3751609 },
            { nameEnglish: "Saskatchewan", perim: 3529235 },
            { nameEnglish: "Alberta", perim: 3525562 },
            { nameEnglish: "British Columbia", perim: 7431794 },
            { nameEnglish: "Yukon", perim: 3743373 },
            { nameEnglish: "Northwest Territories", perim: 11134550 },
            { nameEnglish: "Nunavut", perim: 33718590 },
        ])
    })
    it("should calculate the perimeter of geometries in kilometers", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.flipCoordinates("geom")
        await table.perimeter("geom", "perim", { unit: "km" })
        await table.round("perim")
        await table.selectColumns(["nameEnglish", "perim"])
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { nameEnglish: "Newfoundland and Labrador", perim: 6925 },
            { nameEnglish: "Prince Edward Island", perim: 492 },
            { nameEnglish: "Nova Scotia", perim: 1714 },
            { nameEnglish: "New Brunswick", perim: 1300 },
            { nameEnglish: "Quebec", perim: 10534 },
            { nameEnglish: "Ontario", perim: 6783 },
            { nameEnglish: "Manitoba", perim: 3752 },
            { nameEnglish: "Saskatchewan", perim: 3529 },
            { nameEnglish: "Alberta", perim: 3526 },
            { nameEnglish: "British Columbia", perim: 7432 },
            { nameEnglish: "Yukon", perim: 3743 },
            { nameEnglish: "Northwest Territories", perim: 11135 },
            { nameEnglish: "Nunavut", perim: 33719 },
        ])
    })
})
