import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("joinGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should do a left spatial join the intersect method", async () => {
        const prov = sdb.newTable()
        await prov.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        const poly = sdb.newTable()
        await poly.loadGeoData("test/geodata/files/polygons.geojson")

        await prov.joinGeo(poly, "intersect")
        await prov.selectColumns(["nameEnglish", "name"])

        const data = await prov.getData()
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
    it("should do a left spatial join the intersect method with tables with default names", async () => {
        const prov = sdb.newTable()
        await prov.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        const poly = sdb.newTable()
        await poly.loadGeoData("test/geodata/files/polygons.geojson")

        await prov.joinGeo(poly, "intersect")

        const columnsLeftTable = await prov.getColumns()

        assert.deepStrictEqual(columnsLeftTable, [
            "nameEnglish",
            "nameFrench",
            "geom",
            "name",
            "geom_1",
        ])
    })
    it("should do a left spatial join the intersect method with tables with specific names", async () => {
        const prov = sdb.newTable("prov")
        await prov.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        const poly = sdb.newTable("poly")
        await poly.loadGeoData("test/geodata/files/polygons.geojson")

        await prov.joinGeo(poly, "intersect")

        const columnsLeftTable = await prov.getColumns()

        assert.deepStrictEqual(columnsLeftTable, [
            "nameEnglish",
            "nameFrench",
            "geom",
            "name",
            "geomPoly",
        ])
    })
    it("should do a left spatial join the intersect method without changing the name of the original tables", async () => {
        const prov = sdb.newTable()
        await prov.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        const poly = sdb.newTable()
        await poly.loadGeoData("test/geodata/files/polygons.geojson")

        await prov.joinGeo(poly, "intersect")

        const columnsLeftTable = await prov.getColumns()
        const columnsRightTable = await poly.getColumns()

        assert.deepStrictEqual(
            { columnsLeftTable, columnsRightTable },
            {
                columnsLeftTable: [
                    "nameEnglish",
                    "nameFrench",
                    "geom",
                    "name",
                    "geom_1",
                ],
                columnsRightTable: ["name", "geom"],
            }
        )
    })
    it("should do a left spatial join the intersect method with specific options", async () => {
        const prov = sdb.newTable()
        await prov.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await prov.renameColumns({ geom: "geomProvince" })
        const poly = sdb.newTable()
        await poly.loadGeoData("test/geodata/files/polygons.geojson")
        await poly.renameColumns({ geom: "geomPolygon" })

        const joined = await prov.joinGeo(poly, "intersect", {
            columnLeftTable: "geomProvince",
            columnRightTable: "geomPolygon",
            type: "inner",
            outputTable: "joined",
        })
        await joined.selectColumns(["nameEnglish", "name"])

        const data = await joined.getData()

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
        const points = sdb.newTable()
        await points.loadGeoData("test/geodata/files/pointsInside.json")

        const poly = sdb.newTable()
        await poly.loadGeoData("test/geodata/files/polygonInside.json")
        await poly.renameColumns({ name: "polygonName" })

        await points.joinGeo(poly, "inside")
        await points.selectColumns(["name", "polygonName"])

        const data = await points.getData()

        assert.deepStrictEqual(data, [
            { name: "pointC", polygonName: "container" },
            { name: "pointD", polygonName: "container" },
            { name: "pointA", polygonName: null },
            { name: "pointB", polygonName: null },
        ])
    })
    it("should return all intersections and all rows from leftTable when doing a left join", async () => {
        const polygonsWithin = sdb.newTable()
        await polygonsWithin.loadGeoData(
            "test/geodata/files/polygonsWithinPolygons.json"
        )

        const polygonsWithinNotNull = await polygonsWithin.cloneTable({
            condition: `name NOT NULL`,
        })
        await polygonsWithinNotNull.removeColumns("container")

        const containers = await polygonsWithin.cloneTable({
            condition: `container NOT NULL`,
        })
        await containers.removeColumns("name")

        const joined = await polygonsWithinNotNull.joinGeo(
            containers,
            "intersect",
            {
                outputTable: "joined",
            }
        )
        await joined.selectColumns(["name", "container"])
        await joined.sort({ name: "asc" })
        const data = await joined.getData()

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
        const polygonsWithin = sdb.newTable()
        await polygonsWithin.loadGeoData(
            "test/geodata/files/polygonsWithinPolygons.json"
        )

        const polygonsWithinNotNull = await polygonsWithin.cloneTable({
            condition: `name NOT NULL`,
        })
        await polygonsWithinNotNull.removeColumns("container")

        const containers = await polygonsWithin.cloneTable({
            condition: `container NOT NULL`,
        })
        await containers.removeColumns("name")

        const joined = await polygonsWithinNotNull.joinGeo(
            containers,
            "intersect",
            {
                outputTable: "joined",
                type: "inner",
            }
        )
        await joined.selectColumns(["name", "container"])
        await joined.sort({ name: "asc" })
        const data = await joined.getData()

        assert.deepStrictEqual(data, [
            { name: "B", container: "A" },
            { name: "B", container: "B" },
            { name: "C", container: "A" },
            { name: "C", container: "B" },
            { name: "D", container: "A" },
        ])
    })
})
