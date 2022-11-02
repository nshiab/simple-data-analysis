import assert from "assert";
import valuesToString from "../../../../src/methods/cleaning/valuesToString.js";
describe("valuesToString", function () {
    it("should convert values to string", function () {
        const data = [{ key1: 1, key2: 2 }];
        const stringifiedData = valuesToString(data, "key1");
        assert.deepEqual(stringifiedData, [{ key1: "1", key2: 2 }]);
    });
});
//# sourceMappingURL=valuesToString.test.js.map