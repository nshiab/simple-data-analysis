import assert from "assert";
import checkEnvironment from "../../../src/helpers/checkEnvironment.js";
describe("checkEnvironment", function () {
    it("should return the environment", function () {
        const env = checkEnvironment();
        assert.deepEqual(env, "nodejs");
    });
});
//# sourceMappingURL=checkEnvironment.test.js.map