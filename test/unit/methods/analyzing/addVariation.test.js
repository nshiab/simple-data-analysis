import assert from "assert";
import addVariation from "../../../../src/methods/analyzing/addVariation.js";
describe("addVariation", function () {
    it("should add a variation inside a newKey", function () {
        const data = [
            { key1: "yellow", key2: 12 },
            { key1: "red", key2: 1 },
            { key1: "blue", key2: 5 },
            { key1: "pink", key2: 25 },
        ];
        const variationData = addVariation(data, "key2", "key2Variation", (a, b) => typeof a === "number" && typeof b === "number" ? a - b : NaN);
        assert.deepEqual(variationData, [
            { key1: "yellow", key2: 12, key2Variation: undefined },
            { key1: "red", key2: 1, key2Variation: 11 },
            { key1: "blue", key2: 5, key2Variation: -4 },
            { key1: "pink", key2: 25, key2Variation: -20 },
        ]);
    });
    it("should sort ascendingly first and then add a variation inside a newKey, with a defined first value", function () {
        const data = [
            { key1: "yellow", key2: 12 },
            { key1: "red", key2: 1 },
            { key1: "blue", key2: 5 },
            { key1: "pink", key2: 25 },
        ];
        const variationData = addVariation(data, "key2", "key2Variation", (a, b) => typeof a === "number" && typeof b === "number" ? a - b : NaN, "ascending", 0);
        assert.deepEqual(variationData, [
            { key1: "red", key2: 1, key2Variation: 0 },
            { key1: "blue", key2: 5, key2Variation: -4 },
            { key1: "yellow", key2: 12, key2Variation: -7 },
            { key1: "pink", key2: 25, key2Variation: -13 },
        ]);
    });
    it("should sort descendingly first and then add a variation inside a newKey, with a defined first value", function () {
        const data = [
            { key1: "yellow", key2: 12 },
            { key1: "red", key2: 1 },
            { key1: "blue", key2: 5 },
            { key1: "pink", key2: 25 },
        ];
        const variationData = addVariation(data, "key2", "key2Variation", (a, b) => typeof a === "number" && typeof b === "number" ? a - b : NaN, "descending", 0);
        assert.deepEqual(variationData, [
            { key1: "pink", key2: 25, key2Variation: 0 },
            { key1: "yellow", key2: 12, key2Variation: 13 },
            { key1: "blue", key2: 5, key2Variation: 7 },
            { key1: "red", key2: 1, key2Variation: 4 },
        ]);
    });
});
//# sourceMappingURL=addVariation.test.js.map