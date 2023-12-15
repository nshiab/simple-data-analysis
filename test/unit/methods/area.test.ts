import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("area", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.reproject(
            "geodata",
            "geom",
            "EPSG:4326",
            "EPSG:3347"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should calculate the area of geometries", async () => {
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
                area: 397993584863,
            },
            {
                nameEnglish: "Prince Edward Island",
                nameFrench: "Île-du-Prince-Édouard",
                area: 6054304069,
            },
            {
                nameEnglish: "Nova Scotia",
                nameFrench: "Nouvelle-Écosse",
                area: 58911632890,
            },
            {
                nameEnglish: "New Brunswick",
                nameFrench: "Nouveau-Brunswick",
                area: 74400254883,
            },
            {
                nameEnglish: "Quebec",
                nameFrench: "Québec",
                area: 1474790458654,
            },
            {
                nameEnglish: "Ontario",
                nameFrench: "Ontario",
                area: 973669312293,
            },
            {
                nameEnglish: "Manitoba",
                nameFrench: "Manitoba",
                area: 627551804386,
            },
            {
                nameEnglish: "Saskatchewan",
                nameFrench: "Saskatchewan",
                area: 632530143909,
            },
            {
                nameEnglish: "Alberta",
                nameFrench: "Alberta",
                area: 639689656247,
            },
            {
                nameEnglish: "British Columbia",
                nameFrench: "Colombie-Britannique",
                area: 907899872957,
            },
            { nameEnglish: "Yukon", nameFrench: "Yukon", area: 455413471710 },
            {
                nameEnglish: "Northwest Territories",
                nameFrench: "Territoires du Nord-Ouest",
                area: 1274701572599,
            },
            {
                nameEnglish: "Nunavut",
                nameFrench: "Nunavut",
                area: 2008939671560,
            },
        ])
    })
})
