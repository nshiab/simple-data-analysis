import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("isValidGeo", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should find that geometries are valid", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.isValidGeo("geoData", "geom", "isValid")
        await simpleNodeDB.selectColumns("geoData", [
            "nameEnglish",
            "nameFrench",
            "isValid",
        ])
        const data = await simpleNodeDB.getData("geoData")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                nameFrench: "Terre-Neuve-et-Labrador",
                isValid: true,
            },
            {
                nameEnglish: "Prince Edward Island",
                nameFrench: "Île-du-Prince-Édouard",
                isValid: true,
            },
            {
                nameEnglish: "Nova Scotia",
                nameFrench: "Nouvelle-Écosse",
                isValid: true,
            },
            {
                nameEnglish: "New Brunswick",
                nameFrench: "Nouveau-Brunswick",
                isValid: true,
            },
            { nameEnglish: "Quebec", nameFrench: "Québec", isValid: true },
            { nameEnglish: "Ontario", nameFrench: "Ontario", isValid: true },
            { nameEnglish: "Manitoba", nameFrench: "Manitoba", isValid: true },
            {
                nameEnglish: "Saskatchewan",
                nameFrench: "Saskatchewan",
                isValid: true,
            },
            { nameEnglish: "Alberta", nameFrench: "Alberta", isValid: true },
            {
                nameEnglish: "British Columbia",
                nameFrench: "Colombie-Britannique",
                isValid: true,
            },
            { nameEnglish: "Yukon", nameFrench: "Yukon", isValid: true },
            {
                nameEnglish: "Northwest Territories",
                nameFrench: "Territoires du Nord-Ouest",
                isValid: true,
            },
            { nameEnglish: "Nunavut", nameFrench: "Nunavut", isValid: true },
        ])
    })
    it("should find that geometries are not valid", async () => {
        // From https://github.com/chrieke/geojson-invalid-geometry
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/invalid.geojson"
        )
        await simpleNodeDB.isValidGeo("geoData", "geom", "isValid")
        await simpleNodeDB.selectColumns("geoData", "isValid")
        const data = await simpleNodeDB.getData("geoData")

        assert.deepStrictEqual(data, [{ isValid: false }])
    })
})
