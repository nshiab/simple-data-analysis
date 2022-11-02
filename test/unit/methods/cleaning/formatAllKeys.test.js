import assert from "assert";
import formatAllKeys from "../../../../src/methods/cleaning/formatAllKeys.js";
describe("formatAllKeys", function () {
    it("should format keys", function () {
        const data = [{ key1_key2_a: 1, "key1 key2 b": 2, "key1-key2#c": 3 }];
        const formatedData = formatAllKeys(data);
        assert.deepEqual(formatedData, [
            { key1Key2A: 1, key1Key2B: 2, key1Key2C: 3 },
        ]);
    });
});
//# sourceMappingURL=formatAllKeys.test.js.map