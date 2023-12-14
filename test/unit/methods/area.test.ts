import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("area", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ loadSpatial: true })
        await simpleNodeDB.loadGeoData(
            "geoData",
            "test/geoData/files/CanadianProvincesAndTerritories.geojson"
        )
        await simpleNodeDB.flipCoordinates("geoData", "geom")
        await simpleNodeDB.reproject(
            "geoData",
            "geom",
            "EPSG:4326",
            "EPSG:3347"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should calculate the area of geometries", async () => {
        await simpleNodeDB.area("geoData", "geom", "area")
        await simpleNodeDB.selectColumns("geoData", [
            "nameEnglish",
            "nameFrench",
            "area",
        ])
        const data = await simpleNodeDB.getData("geoData")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                nameFrench: "Terre-Neuve-et-Labrador",
                area: 397245372767.01013,
            },
            {
                nameEnglish: "Prince Edward Island",
                nameFrench: "Île-du-Prince-Édouard",
                area: 6079381739.503868,
            },
            {
                nameEnglish: "Nova Scotia",
                nameFrench: "Nouvelle-Écosse",
                area: 57252867595.350845,
            },
            {
                nameEnglish: "New Brunswick",
                nameFrench: "Nouveau-Brunswick",
                area: 74316569364.58287,
            },
            {
                nameEnglish: "Quebec",
                nameFrench: "Québec",
                area: 1475196819277.1484,
            },
            {
                nameEnglish: "Ontario",
                nameFrench: "Ontario",
                area: 978080312590.026,
            },
            {
                nameEnglish: "Manitoba",
                nameFrench: "Manitoba",
                area: 627796475721.8663,
            },
            {
                nameEnglish: "Saskatchewan",
                nameFrench: "Saskatchewan",
                area: 632035124407.4833,
            },
            {
                nameEnglish: "Alberta",
                nameFrench: "Alberta",
                area: 640024238418.3344,
            },
            {
                nameEnglish: "British Columbia",
                nameFrench: "Colombie-Britannique",
                area: 917861130588.535,
            },
            {
                nameEnglish: "Yukon",
                nameFrench: "Yukon",
                area: 455673458562.09454,
            },
            {
                nameEnglish: "Northwest Territories",
                nameFrench: "Territoires du Nord-Ouest",
                area: 1275025622351.0215,
            },
            {
                nameEnglish: "Nunavut",
                nameFrench: "Nunavut",
                area: 2007178838194.9365,
            },
        ])
    })
})
