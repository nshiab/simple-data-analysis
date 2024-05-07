import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("area", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should calculate the area of geometries in square meters", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.area("geodata", "geom", "area")
        await simpleNodeDB.selectColumns("geodata", [
            "nameEnglish",
            "nameFrench",
            "area",
        ])
        await simpleNodeDB.round("geoData", "area")
        const data = await simpleNodeDB.getData("geodata")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                nameFrench: "Terre-Neuve-et-Labrador",
                area: 407428312235,
            },
            {
                nameEnglish: "Prince Edward Island",
                nameFrench: "Île-du-Prince-Édouard",
                area: 5922205562,
            },
            {
                nameEnglish: "Nova Scotia",
                nameFrench: "Nouvelle-Écosse",
                area: 56980046392,
            },
            {
                nameEnglish: "New Brunswick",
                nameFrench: "Nouveau-Brunswick",
                area: 72935040140,
            },
            {
                nameEnglish: "Quebec",
                nameFrench: "Québec",
                area: 1508203157285,
            },
            {
                nameEnglish: "Ontario",
                nameFrench: "Ontario",
                area: 980252087873,
            },
            {
                nameEnglish: "Manitoba",
                nameFrench: "Manitoba",
                area: 649626747368,
            },
            {
                nameEnglish: "Saskatchewan",
                nameFrench: "Saskatchewan",
                area: 652741441946,
            },
            {
                nameEnglish: "Alberta",
                nameFrench: "Alberta",
                area: 663023544390,
            },
            {
                nameEnglish: "British Columbia",
                nameFrench: "Colombie-Britannique",
                area: 938271085581,
            },
            { nameEnglish: "Yukon", nameFrench: "Yukon", area: 483592253984 },
            {
                nameEnglish: "Northwest Territories",
                nameFrench: "Territoires du Nord-Ouest",
                area: 1347423374589,
            },
            {
                nameEnglish: "Nunavut",
                nameFrench: "Nunavut",
                area: 2090913434132,
            },
        ])
    })
    it("should calculate the area of geometries in square kilometers", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.area("geodata", "geom", "area", { unit: "km2" })
        await simpleNodeDB.selectColumns("geodata", [
            "nameEnglish",
            "nameFrench",
            "area",
        ])
        await simpleNodeDB.round("geoData", "area")
        const data = await simpleNodeDB.getData("geodata")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                nameFrench: "Terre-Neuve-et-Labrador",
                area: 407428,
            },
            {
                nameEnglish: "Prince Edward Island",
                nameFrench: "Île-du-Prince-Édouard",
                area: 5922,
            },
            {
                nameEnglish: "Nova Scotia",
                nameFrench: "Nouvelle-Écosse",
                area: 56980,
            },
            {
                nameEnglish: "New Brunswick",
                nameFrench: "Nouveau-Brunswick",
                area: 72935,
            },
            { nameEnglish: "Quebec", nameFrench: "Québec", area: 1508203 },
            { nameEnglish: "Ontario", nameFrench: "Ontario", area: 980252 },
            { nameEnglish: "Manitoba", nameFrench: "Manitoba", area: 649627 },
            {
                nameEnglish: "Saskatchewan",
                nameFrench: "Saskatchewan",
                area: 652741,
            },
            { nameEnglish: "Alberta", nameFrench: "Alberta", area: 663024 },
            {
                nameEnglish: "British Columbia",
                nameFrench: "Colombie-Britannique",
                area: 938271,
            },
            { nameEnglish: "Yukon", nameFrench: "Yukon", area: 483592 },
            {
                nameEnglish: "Northwest Territories",
                nameFrench: "Territoires du Nord-Ouest",
                area: 1347423,
            },
            { nameEnglish: "Nunavut", nameFrench: "Nunavut", area: 2090913 },
        ])
    })
})
