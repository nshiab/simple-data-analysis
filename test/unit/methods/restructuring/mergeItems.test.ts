import assert from "assert"
import SimpleData from "../../../../src/class/SimpleData.js"
import mergeItems from "../../../../src/methods/restructuring/mergeItems.js"

describe("mergeItems", function () {
    it("should add keys based on a common key", function () {
        const data = [
            { patate: "red", poil: 1 },
            { patate: "yellow", poil: 2 },
        ]
        const dataToBeMerged = [
            { patate: "yellow", animal: "raton" },
            { patate: "red", animal: "castor" },
        ]
        const newData = mergeItems(data, dataToBeMerged, "patate")

        assert.deepEqual(newData, [
            { patate: "red", poil: 1, animal: "castor" },
            { patate: "yellow", animal: "raton", poil: 2 },
        ])
    })

    it("should merge items as a SimpleData instance", function () {
        const data = [
            { patate: "red", poil: 1 },
            { patate: "yellow", poil: 2 },
        ]
        const dataToBeMerged = new SimpleData({
            data: [
                { patate: "yellow", animal: "raton" },
                { patate: "red", animal: "castor" },
            ],
        })
        const newData = mergeItems(data, dataToBeMerged, "patate")

        assert.deepEqual(newData, [
            { patate: "red", poil: 1, animal: "castor" },
            { patate: "yellow", animal: "raton", poil: 2 },
        ])
    })
})
