import assert from "assert"
import addPercentageDistribution from "../../../../src/methods/analyzing/addPercentageDistribution.js"

describe("addPercentageDistribution", function () {
    it("should calculate the percentage distribution for a group of keys inside each item", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 12, poil: 21 },
            { patate: 145, poil: 22 },
            { patate: 111, poil: 2222 },
        ]
        const dataWithPercentages = addPercentageDistribution(data, {
            method: "item",
            keys: ["patate", "poil"],
        })

        assert.deepEqual(dataWithPercentages, [
            { patate: 1, poil: 2, patatePercent: 0.33, poilPercent: 0.67 },
            { patate: 12, poil: 21, patatePercent: 0.36, poilPercent: 0.64 },
            { patate: 145, poil: 22, patatePercent: 0.87, poilPercent: 0.13 },
            { patate: 111, poil: 2222, patatePercent: 0.05, poilPercent: 0.95 },
        ])
    })

    it("should calculate a percentage distribution over the whole data and add the result in a new key", function () {
        const data = [
            { patate: "yellow", poil: 1 },
            { patate: "red", poil: 2 },
            { patate: "yellow", poil: 5 },
            { patate: "yellow", poil: 10 },
            { patate: "red", poil: 5 },
            { patate: "yellow", poil: 2 },
            { patate: "red", poil: 22 },
            { patate: "red", poil: 13 },
        ]
        const dataWithPercentages = addPercentageDistribution(data, {
            method: "data",
            key: "poil",
            newKey: "poilPercent",
        })

        assert.deepEqual(dataWithPercentages, [
            { patate: "yellow", poil: 1, poilPercent: 0.02 },
            { patate: "red", poil: 2, poilPercent: 0.03 },
            { patate: "yellow", poil: 5, poilPercent: 0.08 },
            { patate: "yellow", poil: 10, poilPercent: 0.17 },
            { patate: "red", poil: 5, poilPercent: 0.08 },
            { patate: "yellow", poil: 2, poilPercent: 0.03 },
            { patate: "red", poil: 22, poilPercent: 0.37 },
            { patate: "red", poil: 13, poilPercent: 0.22 },
        ])
    })

    it("should calculate a percentage distribution over each group in the data and add the result in a new key", function () {
        const data = [
            { animal: "caribou", patate: "yellow", poil: 1 },
            { animal: "caribou", patate: "red", poil: 2 },
            { animal: "caribou", patate: "yellow", poil: 5 },
            { animal: "caribou", patate: "yellow", poil: 10 },
            { animal: "castor", patate: "red", poil: 5 },
            { animal: "castor", patate: "yellow", poil: 2 },
            { animal: "castor", patate: "red", poil: 22 },
            { animal: "castor", patate: "red", poil: 13 },
        ]
        const dataWithPercentages = addPercentageDistribution(data, {
            method: "data",
            key: "poil",
            newKey: "animalPatatePercent",
            groupKeys: ["animal", "patate"],
        })

        assert.deepEqual(dataWithPercentages, [
            {
                animal: "caribou",
                patate: "yellow",
                poil: 1,
                animalPatatePercent: 0.06,
            },
            {
                animal: "caribou",
                patate: "red",
                poil: 2,
                animalPatatePercent: 1,
            },
            {
                animal: "caribou",
                patate: "yellow",
                poil: 5,
                animalPatatePercent: 0.31,
            },
            {
                animal: "caribou",
                patate: "yellow",
                poil: 10,
                animalPatatePercent: 0.63,
            },
            {
                animal: "castor",
                patate: "red",
                poil: 5,
                animalPatatePercent: 0.13,
            },
            {
                animal: "castor",
                patate: "yellow",
                poil: 2,
                animalPatatePercent: 1,
            },
            {
                animal: "castor",
                patate: "red",
                poil: 22,
                animalPatatePercent: 0.55,
            },
            {
                animal: "castor",
                patate: "red",
                poil: 13,
                animalPatatePercent: 0.33,
            },
        ])
    })
})
