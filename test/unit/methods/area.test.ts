import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("area", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should calculate the area of geometries in square meters", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.flipCoordinates("geom")
        await table.area("area")
        await table.selectColumns(["nameEnglish", "nameFrench", "area"])
        await table.round("area")
        const data = await table.getData()

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
    it("should calculate the area of geometries in square meters from a specific column", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.flipCoordinates("geom")
        await table.area("area", { column: "geom" })
        await table.selectColumns(["nameEnglish", "nameFrench", "area"])
        await table.round("area")
        const data = await table.getData()

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
    it("should calculate the area of geometries in square meters with a file loaded with option toWGS84", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json",
            {
                toWGS84: true,
            }
        )
        // No need to flip
        // await table.flipCoordinates("geom")
        await table.area("area")
        await table.selectColumns(["nameEnglish", "nameFrench", "area"])
        await table.round("area")
        const data = await table.getData()

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
        const table = sdb.newTable("geodata")
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.flipCoordinates("geom")
        await table.area("area", { unit: "km2" })
        await table.selectColumns(["nameEnglish", "nameFrench", "area"])
        await table.round("area")
        const data = await table.getData()

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
