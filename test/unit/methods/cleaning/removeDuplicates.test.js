import assert from "assert";
import removeDuplicates from "../../../../src/methods/cleaning/removeDuplicates.js";
describe("removeDuplicates", function () {
    it("should not remove items", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
            { key1: 3, key2: 3 },
        ];
        const newData = removeDuplicates(data);
        assert.deepEqual(newData, data);
    });
    it("should remove duplicates but keep one", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ];
        const newData = removeDuplicates(data);
        assert.deepEqual(newData, [
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ]);
    });
    it("should remove duplicates with specific key but keep one", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ];
        const newData = removeDuplicates(data, "id");
        assert.deepEqual(newData, [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 2, key1: 4, key2: 4 },
        ]);
    });
    it("should remove duplicates but keep none", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ];
        const newData = removeDuplicates(data, undefined, 0);
        assert.deepEqual(newData, [{ key1: 2, key2: 2 }]);
    });
    it("should remove duplicates with specific key but none", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ];
        const newData = removeDuplicates(data, "id", 0);
        assert.deepEqual(newData, [
            { id: 0, key1: 1, key2: 1 },
            { id: 2, key1: 4, key2: 4 },
        ]);
    });
    it("should throw with non existing key", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ];
        assert.throws(() => removeDuplicates(data, "peanut"));
    });
});
//# sourceMappingURL=removeDuplicates.test.js.map