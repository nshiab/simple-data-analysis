import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("inside", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should check if geometries are inside other geometries", async () => {
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/pointsInside.json")
        await points.renameColumns({
            name: "points",
            geom: "geomPoints",
        })

        const polygon = sdb.newTable("polygon")
        await polygon.loadGeoData("test/geodata/files/polygonInside.json")
        await polygon.renameColumns({
            name: "polygon",
            geom: "geomPolygon",
        })

        await points.crossJoin(polygon)
        await points.inside("geomPoints", "geomPolygon", "isInside")
        await points.selectColumns(["points", "polygon", "isInside"])
        await points.sort({ points: "asc" })

        const data = await points.getData()

        assert.deepStrictEqual(data, [
            { points: "pointA", polygon: "container", isInside: false },
            { points: "pointB", polygon: "container", isInside: false },
            { points: "pointC", polygon: "container", isInside: true },
            { points: "pointD", polygon: "container", isInside: true },
        ])
    })
})
