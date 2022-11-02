import assert from "assert";
import modifyValues from "../../../../src/methods/cleaning/modifyValues.js";
describe("modifyValues", function () {
    it("should modify values", function () {
        const data = [{ key1: 1 }, { key1: 11 }];
        const modifiedData = modifyValues(data, "key1", (value) => value * 2);
        assert.deepEqual(modifiedData, [{ key1: 2 }, { key1: 22 }]);
    });
});
//# sourceMappingURL=modifyValues.test.js.map