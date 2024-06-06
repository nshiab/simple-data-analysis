import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("intersection", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should compute the intersection of geometries", async () => {
        const prov = sdb.newTable("prov")
        await prov.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await prov.flipCoordinates("geom")
        await prov.renameColumns({ geom: "prov" })

        const poly = sdb.newTable("poly")
        await poly.loadGeoData("test/geodata/files/polygons.geojson")
        await poly.flipCoordinates("geom")
        await poly.area("polArea")
        await poly.round("polArea")
        await poly.renameColumns({ geom: "pol" })

        const joined = await prov.crossJoin(poly, { outputTable: "joined" })
        await joined.intersection("pol", "prov", "intersec")
        await joined.area("intersecArea", { column: "intersec" })
        await joined.round("intersecArea")
        await joined.addColumn(
            "intersecPerc",
            "double",
            `ROUND(intersecArea/polArea, 4)`
        )

        await joined.selectColumns(["nameEnglish", "name", "intersecPerc"])
        const data = await joined.getData()

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                name: "polygonA",
                intersecPerc: 0,
            },
            {
                nameEnglish: "Prince Edward Island",
                name: "polygonA",
                intersecPerc: 0,
            },
            { nameEnglish: "Nova Scotia", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "New Brunswick", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "Quebec", name: "polygonA", intersecPerc: 0.6448 },
            { nameEnglish: "Ontario", name: "polygonA", intersecPerc: 0.332 },
            { nameEnglish: "Manitoba", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "Saskatchewan", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "Alberta", name: "polygonA", intersecPerc: 0 },
            {
                nameEnglish: "British Columbia",
                name: "polygonA",
                intersecPerc: 0,
            },
            { nameEnglish: "Yukon", name: "polygonA", intersecPerc: 0 },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonA",
                intersecPerc: 0,
            },
            { nameEnglish: "Nunavut", name: "polygonA", intersecPerc: 0 },
            {
                nameEnglish: "Newfoundland and Labrador",
                name: "polygonB",
                intersecPerc: 0,
            },
            {
                nameEnglish: "Prince Edward Island",
                name: "polygonB",
                intersecPerc: 0,
            },
            { nameEnglish: "Nova Scotia", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "New Brunswick", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "Quebec", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "Ontario", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "Manitoba", name: "polygonB", intersecPerc: 0.143 },
            {
                nameEnglish: "Saskatchewan",
                name: "polygonB",
                intersecPerc: 0.294,
            },
            { nameEnglish: "Alberta", name: "polygonB", intersecPerc: 0.2992 },
            {
                nameEnglish: "British Columbia",
                name: "polygonB",
                intersecPerc: 0.0404,
            },
            { nameEnglish: "Yukon", name: "polygonB", intersecPerc: 0 },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonB",
                intersecPerc: 0.1796,
            },
            { nameEnglish: "Nunavut", name: "polygonB", intersecPerc: 0.0366 },
        ])
    })
})
