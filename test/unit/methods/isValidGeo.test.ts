import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("isValidGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should find that geometries are valid", async () => {
        await sdb.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.isValidGeo("geoData", "geom", "isValid")
        await sdb.selectColumns("geoData", [
            "nameEnglish",
            "nameFrench",
            "isValid",
        ])
        const data = await sdb.getData("geoData")

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
        await sdb.loadGeoData("geodata", "test/geodata/files/invalid.geojson")
        await sdb.isValidGeo("geoData", "geom", "isValid")
        await sdb.selectColumns("geoData", "isValid")
        const data = await sdb.getData("geoData")

        assert.deepStrictEqual(data, [{ isValid: false }])
    })
})
