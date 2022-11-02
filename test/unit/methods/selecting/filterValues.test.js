import assert from "assert";
import filterValues from "../../../../src/methods/selecting/filterValues.js";
describe("filterValues", function () {
    it("should filter values", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ];
        const newData = filterValues(data, "key2", (value) => value ? value < 5 : false);
        assert.deepEqual(newData, [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]);
    });
});
//# sourceMappingURL=filterValues.test.js.map