import assert from "assert";
import * as sda from "../dist/index.js"

describe('sda.describe()', function () {
    it('should return a string', function () {
        assert.equal(typeof sda.describe("Nael"), "string");
    });
});
