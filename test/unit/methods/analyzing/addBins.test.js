import assert from "assert";
import addBins from "../../../../src/methods/analyzing/addBins.js";
describe("addBins", function () {
    it("should add bins", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ];
        const binsData = addBins(data, "key1", "bin", 5);
        assert.deepEqual(binsData, [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 2 },
            { key1: 3, bin: 3 },
            { key1: 4, bin: 4 },
            { key1: 5, bin: 5 },
        ]);
    });
    it("should add bins with uneven nbBins", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ];
        const binsData = addBins(data, "key1", "bin", 2);
        assert.deepEqual(binsData, [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 1 },
            { key1: 3, bin: 2 },
            { key1: 4, bin: 2 },
            { key1: 5, bin: 2 },
        ]);
    });
    it("should add bins with skewed left distribution", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 50 },
        ];
        const binsData = addBins(data, "key1", "bin", 2);
        assert.deepEqual(binsData, [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 1 },
            { key1: 3, bin: 1 },
            { key1: 4, bin: 1 },
            { key1: 50, bin: 2 },
        ]);
    });
    it("should add bins with skewed right distribution", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 50 },
            { key1: 51 },
            { key1: 52 },
            { key1: 100 },
        ];
        const binsData = addBins(data, "key1", "bin", 4);
        assert.deepEqual(binsData, [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 1 },
            { key1: 50, bin: 2 },
            { key1: 51, bin: 3 },
            { key1: 52, bin: 3 },
            { key1: 100, bin: 4 },
        ]);
    });
    it("should throw error if nbBins < 1", function () {
        const data = [{ key1: 1 }];
        assert.throws(() => addBins(data, "key1", "bin", 0));
    });
    it("should throw error if key does not exists", function () {
        const data = [{ key1: 1 }];
        assert.throws(() => addBins(data, "key2", "bin", 5));
    });
    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1 }];
        assert.throws(() => addBins(data, "key1", "key1", 5));
    });
});
//# sourceMappingURL=addBins.test.js.map