import assert from "assert";
import SimpleData from "../../../../src/class/SimpleData.js";
import mergeItems from "../../../../src/methods/restructuring/mergeItems.js";
describe("mergeItems", function () {
    it("should add keys based on a common key", function () {
        const data = [
            { key1: "red", key2: 1 },
            { key1: "yellow", key2: 2 },
        ];
        const dataToBeMerged = [
            { key1: "yellow", key3: "raton" },
            { key1: "red", key3: "castor" },
        ];
        const newData = mergeItems(data, dataToBeMerged, "key1");
        assert.deepEqual(newData, [
            { key1: "red", key2: 1, key3: "castor" },
            { key1: "yellow", key3: "raton", key2: 2 },
        ]);
    });
    it("should merge items as a SimpleData instance", function () {
        const data = [
            { key1: "red", key2: 1 },
            { key1: "yellow", key2: 2 },
        ];
        const dataToBeMerged = new SimpleData({
            data: [
                { key1: "yellow", key3: "raton" },
                { key1: "red", key3: "castor" },
            ],
        });
        const newData = mergeItems(data, dataToBeMerged, "key1");
        assert.deepEqual(newData, [
            { key1: "red", key2: 1, key3: "castor" },
            { key1: "yellow", key3: "raton", key2: 2 },
        ]);
    });
});
//# sourceMappingURL=mergeItems.test.js.map