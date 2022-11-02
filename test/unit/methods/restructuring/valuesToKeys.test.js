import assert from "assert";
import valuesToKeys from "../../../../src/methods/restructuring/valuesToKeys.js";
describe("valuesToKeys", function () {
    it("should take two keys, one for the new keys and one for their values, and create new keys based on them", function () {
        const data = [
            { Departement: "accounting", year: "2015", nbEmployees: 10 },
            { Departement: "accounting", year: "2016", nbEmployees: 9 },
            { Departement: "accounting", year: "2017", nbEmployees: 15 },
            { Departement: "accounting", year: "2018", nbEmployees: 11 },
            { Departement: "accounting", year: "2019", nbEmployees: 25 },
            { Departement: "accounting", year: "2020", nbEmployees: 32 },
            { Departement: "R&D", year: "2015", nbEmployees: 1 },
            { Departement: "R&D", year: "2016", nbEmployees: 2 },
            { Departement: "R&D", year: "2017", nbEmployees: 5 },
            { Departement: "R&D", year: "2018", nbEmployees: 2 },
            { Departement: "R&D", year: "2019", nbEmployees: 2 },
            { Departement: "R&D", year: "2020", nbEmployees: 3 },
            { Departement: "sales", year: "2015", nbEmployees: 2 },
            { Departement: "sales", year: "2016", nbEmployees: 7 },
            { Departement: "sales", year: "2017", nbEmployees: 15 },
            { Departement: "sales", year: "2018", nbEmployees: 32 },
            { Departement: "sales", year: "2019", nbEmployees: 45 },
            { Departement: "sales", year: "2020", nbEmployees: 27 },
        ];
        const newData = valuesToKeys(data, "year", "nbEmployees");
        assert.deepStrictEqual(newData, [
            {
                Departement: "accounting",
                "2015": 10,
                "2016": 9,
                "2017": 15,
                "2018": 11,
                "2019": 25,
                "2020": 32,
            },
            {
                Departement: "R&D",
                "2015": 1,
                "2016": 2,
                "2017": 5,
                "2018": 2,
                "2019": 2,
                "2020": 3,
            },
            {
                Departement: "sales",
                "2015": 2,
                "2016": 7,
                "2017": 15,
                "2018": 32,
                "2019": 45,
                "2020": 27,
            },
        ]);
    });
});
//# sourceMappingURL=valuesToKeys.test.js.map