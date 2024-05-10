import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("perimeter", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should calculate the perimeter of geometries in meters", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.perimeter("geodata", "geom", "perim")
        await simpleNodeDB.round("geodata", "perim")
        await simpleNodeDB.selectColumns("geodata", ["nameEnglish", "perim"])
        const data = await simpleNodeDB.getData("geodata")

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
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.perimeter("geodata", "geom", "perim", { unit: "km" })
        await simpleNodeDB.round("geodata", "perim")
        await simpleNodeDB.selectColumns("geodata", ["nameEnglish", "perim"])
        const data = await simpleNodeDB.getData("geodata")

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
