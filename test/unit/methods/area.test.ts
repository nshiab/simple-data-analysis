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
        const data = await simpleNodeDB.getData("geodata")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                nameFrench: "Terre-Neuve-et-Labrador",
                area: 397993584863.36475,
            },
            {
                nameEnglish: "Prince Edward Island",
                nameFrench: "Île-du-Prince-Édouard",
                area: 6054304068.637537,
            },
            {
                nameEnglish: "Nova Scotia",
                nameFrench: "Nouvelle-Écosse",
                area: 58911632890.1254,
            },
            {
                nameEnglish: "New Brunswick",
                nameFrench: "Nouveau-Brunswick",
                area: 74400254882.6454,
            },
            {
                nameEnglish: "Quebec",
                nameFrench: "Québec",
                area: 1474790458653.9138,
            },
            {
                nameEnglish: "Ontario",
                nameFrench: "Ontario",
                area: 973669312293.2623,
            },
            {
                nameEnglish: "Manitoba",
                nameFrench: "Manitoba",
                area: 627551804386.3534,
            },
            {
                nameEnglish: "Saskatchewan",
                nameFrench: "Saskatchewan",
                area: 632530143909.3735,
            },
            {
                nameEnglish: "Alberta",
                nameFrench: "Alberta",
                area: 639689656247.384,
            },
            {
                nameEnglish: "British Columbia",
                nameFrench: "Colombie-Britannique",
                area: 907899872957.4146,
            },
            {
                nameEnglish: "Yukon",
                nameFrench: "Yukon",
                area: 455413471710.14825,
            },
            {
                nameEnglish: "Northwest Territories",
                nameFrench: "Territoires du Nord-Ouest",
                area: 1274701572598.9072,
            },
            {
                nameEnglish: "Nunavut",
                nameFrench: "Nunavut",
                area: 2008939671560.4343,
            },
        ])
    })
})
