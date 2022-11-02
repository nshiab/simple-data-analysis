import assert from "assert";
import excludeOutliers from "../../../../src/methods/analyzing/excludeOutliers.js";
describe("excludeOutliers", function () {
    it("should exclude outliers", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 222 },
            { key1: 11111, key2: 2222 },
        ];
        const dataOutliersExcluded = excludeOutliers(data, "key1");
        assert.deepEqual(dataOutliersExcluded, [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 222 },
        ]);
    });
});
//# sourceMappingURL=excludeOutliers.test.js.map