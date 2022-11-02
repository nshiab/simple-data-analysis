import assert from "assert";
import datesToString from "../../../../src/methods/cleaning/datesToString.js";
describe("datesToString", function () {
    it("should convert date to string", function () {
        const data = [{ key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 }];
        const dataParsed = datesToString(data, "key1", "%Y-%m-%d");
        assert.deepEqual(dataParsed, [{ key1: "2022-02-03", key2: 2 }]);
    });
    it("should convert date to string and skip errors", function () {
        const data = [
            { key1: new Date(Date.UTC(2022, 1, 3)), key2: 2 },
            { key1: 12, key2: 2 },
        ];
        const dataParsed = datesToString(data, "key1", "%Y-%m-%d", true);
        assert.deepEqual(dataParsed, [
            { key1: "2022-02-03", key2: 2 },
            { key1: 12, key2: 2 },
        ]);
    });
});
//# sourceMappingURL=datesToString.test.js.map