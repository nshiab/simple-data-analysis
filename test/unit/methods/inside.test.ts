import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("inside", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should check if geometries are inside other geometries", async () => {
        await sdb.loadGeoData("points", "test/geodata/files/pointsInside.json")
        await sdb.renameColumns("points", {
            name: "points",
            geom: "geomPoints",
        })
        await sdb.loadGeoData(
            "polygon",
            "test/geodata/files/polygonInside.json"
        )
        await sdb.renameColumns("polygon", {
            name: "polygon",
            geom: "geomPolygon",
        })
        await sdb.crossJoin("points", "polygon")
        await sdb.inside("points", ["geomPoints", "geomPolygon"], "isInside")

        await sdb.selectColumns("points", ["points", "polygon", "isInside"])
        const data = await sdb.getData("points")

        assert.deepStrictEqual(data, [
            { points: "pointA", polygon: "container", isInside: false },
            { points: "pointB", polygon: "container", isInside: false },
            { points: "pointC", polygon: "container", isInside: true },
            { points: "pointD", polygon: "container", isInside: true },
        ])
    })
})
