import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("inside", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should check if geometries are inside other geometries", async () => {
        await simpleNodeDB.loadGeoData(
            "points",
            "test/geodata/files/pointsInside.json"
        )
        await simpleNodeDB.renameColumns("points", {
            name: "points",
            geom: "geomPoints",
        })
        await simpleNodeDB.loadGeoData(
            "polygon",
            "test/geodata/files/polygonInside.json"
        )
        await simpleNodeDB.renameColumns("polygon", {
            name: "polygon",
            geom: "geomPolygon",
        })
        await simpleNodeDB.crossJoin("points", "polygon")
        await simpleNodeDB.inside(
            "points",
            ["geomPoints", "geomPolygon"],
            "isInside"
        )

        await simpleNodeDB.selectColumns("points", [
            "points",
            "polygon",
            "isInside",
        ])
        const data = await simpleNodeDB.getData("points")

        assert.deepStrictEqual(data, [
            { points: "pointA", polygon: "container", isInside: false },
            { points: "pointB", polygon: "container", isInside: false },
            { points: "pointC", polygon: "container", isInside: true },
            { points: "pointD", polygon: "container", isInside: true },
        ])
    })
})
