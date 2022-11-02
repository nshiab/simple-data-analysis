import assert from "assert";
import checkTypeOfKey from "../../../src/helpers/checkTypeOfKey.js";
describe("checkTypeOfKey", function () {
    it("should check the type of values threshold is 1 and return true", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ];
        const isNumber = checkTypeOfKey(data, "key1", "number", 1);
        assert.deepEqual(isNumber, true);
    });
    it("should check the type of values threshold is 1 and return false", function () {
        const data = [
            { key1: 1 },
            { key1: "2" },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ];
        const isNumber = checkTypeOfKey(data, "key1", "number", 1);
        assert.deepEqual(isNumber, false);
    });
    it("should check the type of values threshold is 0.5 and return false", function () {
        const data = [
            { key1: 1 },
            { key1: "2" },
            { key1: "3" },
            { key1: "4" },
            { key1: 5 },
        ];
        const isNumber = checkTypeOfKey(data, "key1", "number", 0.5);
        assert.deepEqual(isNumber, false);
    });
    it("should check the type of values threshold is 0.5 and return true", function () {
        const data = [
            { key1: 1 },
            { key1: "2" },
            { key1: "3" },
            { key1: "4" },
            { key1: 5 },
        ];
        const isNumber = checkTypeOfKey(data, "key1", "number", 0.5);
        assert.deepEqual(isNumber, false);
    });
});
//# sourceMappingURL=checkTypeOfKey.test.js.map