import assert from "assert";
import keepMissingValues from "../../../../src/methods/cleaning/keepMissingValues.js";
describe("keepMissingValues", function () {
    it("should keep missing values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: 3, key2: NaN },
            { key1: "", key2: 5 },
            { key1: undefined, key2: 4 },
            { key1: 11, key2: 22 },
        ];
        const missingData = keepMissingValues(data);
        assert.deepEqual(missingData, [
            { key1: null, key2: 2 },
            { key1: 3, key2: NaN },
            { key1: "", key2: 5 },
            { key1: undefined, key2: 4 },
        ]);
    });
});
//# sourceMappingURL=keepMissingValues.test.js.map