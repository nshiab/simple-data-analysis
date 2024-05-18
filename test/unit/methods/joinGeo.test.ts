import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("joinGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should do a left spatial join the intersect method", async () => {
        await sdb.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.loadGeoData("pol", "test/geodata/files/polygons.geojson")
        await sdb.joinGeo("prov", "intersect", "pol")
        await sdb.selectColumns("prov", ["nameEnglish", "name"])

        const data = await sdb.getData("prov")
        assert.deepStrictEqual(data, [
            { nameEnglish: "Quebec", name: "polygonA" },
            { nameEnglish: "Ontario", name: "polygonA" },
            { nameEnglish: "Manitoba", name: "polygonB" },
            { nameEnglish: "Saskatchewan", name: "polygonB" },
            { nameEnglish: "Alberta", name: "polygonB" },
            { nameEnglish: "British Columbia", name: "polygonB" },
            { nameEnglish: "Northwest Territories", name: "polygonB" },
            { nameEnglish: "Nunavut", name: "polygonB" },
            { nameEnglish: "Newfoundland and Labrador", name: null },
            { nameEnglish: "Prince Edward Island", name: null },
            { nameEnglish: "Nova Scotia", name: null },
            { nameEnglish: "New Brunswick", name: null },
            { nameEnglish: "Yukon", name: null },
        ])
    })
    it("should do a left spatial join the intersect method without changing the name of the original tables", async () => {
        await sdb.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.loadGeoData("pol", "test/geodata/files/polygons.geojson")
        await sdb.joinGeo("prov", "intersect", "pol")

        const columnsLeftTable = await sdb.getColumns("prov")
        const columnsRightTable = await sdb.getColumns("pol")

        assert.deepStrictEqual(
            { columnsLeftTable, columnsRightTable },
            {
                columnsLeftTable: [
                    "nameEnglish",
                    "nameFrench",
                    "geom",
                    "name",
                    "geomPol",
                ],
                columnsRightTable: ["name", "geom"],
            }
        )
    })
    it("should do a left spatial join the intersect method with specific options", async () => {
        await sdb.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.renameColumns("prov", { geom: "geomProvince" })
        await sdb.loadGeoData("pol", "test/geodata/files/polygons.geojson")
        await sdb.renameColumns("pol", { geom: "geomPolygon" })

        await sdb.joinGeo("prov", "intersect", "pol", {
            columnLeftTable: "geomProvince",
            columnRightTable: "geomPolygon",
            type: "inner",
            outputTable: "joined",
        })
        await sdb.selectColumns("joined", ["nameEnglish", "name"])

        const data = await sdb.getData("joined")
        assert.deepStrictEqual(data, [
            { nameEnglish: "Quebec", name: "polygonA" },
            { nameEnglish: "Ontario", name: "polygonA" },
            { nameEnglish: "Manitoba", name: "polygonB" },
            { nameEnglish: "Saskatchewan", name: "polygonB" },
            { nameEnglish: "Alberta", name: "polygonB" },
            { nameEnglish: "British Columbia", name: "polygonB" },
            { nameEnglish: "Northwest Territories", name: "polygonB" },
            { nameEnglish: "Nunavut", name: "polygonB" },
        ])
    })
    it("should do a left spatial join the inside method", async () => {
        await sdb.loadGeoData("points", "test/geodata/files/pointsInside.json")
        await sdb.loadGeoData(
            "polygon",
            "test/geodata/files/polygonInside.json"
        )
        await sdb.renameColumns("polygon", { name: "polygonName" })
        await sdb.joinGeo("points", "inside", "polygon")
        await sdb.selectColumns("points", ["name", "polygonName"])

        const data = await sdb.getData("points")

        assert.deepStrictEqual(data, [
            { name: "pointC", polygonName: "container" },
            { name: "pointD", polygonName: "container" },
            { name: "pointA", polygonName: null },
            { name: "pointB", polygonName: null },
        ])
    })
    it("should return all intersections and all rows from leftTable when doing a left join", async () => {
        await sdb.loadGeoData(
            "data",
            "test/geodata/files/polygonsWithinPolygons.json"
        )

        await sdb.cloneTable("data", "polygons", {
            condition: `name NOT NULL`,
        })
        await sdb.removeColumns("polygons", "container")
        await sdb.cloneTable("data", "containers", {
            condition: `container NOT NULL`,
        })
        await sdb.removeColumns("containers", "name")

        await sdb.joinGeo("polygons", "intersect", "containers", {
            outputTable: "joined",
        })
        await sdb.selectColumns("joined", ["name", "container"])
        await sdb.sort("joined", { name: "asc" })
        const data = await sdb.getData("joined")

        assert.deepStrictEqual(data, [
            { name: "A", container: null },
            { name: "B", container: "A" },
            { name: "B", container: "B" },
            { name: "C", container: "A" },
            { name: "C", container: "B" },
            { name: "D", container: "A" },
        ])
    })
    it("should return all intersections - and just intersections - when doing an inner join", async () => {
        await sdb.loadGeoData(
            "data",
            "test/geodata/files/polygonsWithinPolygons.json"
        )

        await sdb.cloneTable("data", "polygons", {
            condition: `name NOT NULL`,
        })
        await sdb.removeColumns("polygons", "container")
        await sdb.cloneTable("data", "containers", {
            condition: `container NOT NULL`,
        })
        await sdb.removeColumns("containers", "name")

        await sdb.joinGeo("polygons", "intersect", "containers", {
            outputTable: "joined",
            type: "inner",
        })
        await sdb.selectColumns("joined", ["name", "container"])
        await sdb.sort("joined", { name: "asc" })
        const data = await sdb.getData("joined")

        assert.deepStrictEqual(data, [
            { name: "B", container: "A" },
            { name: "B", container: "B" },
            { name: "C", container: "A" },
            { name: "C", container: "B" },
            { name: "D", container: "A" },
        ])
    })
})
