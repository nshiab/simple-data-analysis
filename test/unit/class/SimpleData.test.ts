import assert from "assert"
import * as fs from 'fs'
import papaparse from "papaparse"
import { temporaryDirectoryTask } from 'tempy'
import { utcParse } from "d3-time-format"
import { SimpleData } from "../../../src/index.js"

describe('SimpleData', function () {
    it('should instantiate', function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        assert.equal(data, simpleData.getData())
    })

    it("should modify public class attributes", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        simpleData.verbose = true
        simpleData.logParameters = true
        simpleData.nbTableItemsToLog = 11
        assert.equal(simpleData.verbose, true)
        assert.equal(simpleData.logParameters, true)
        assert.equal(simpleData.nbTableItemsToLog, 11)
    })

    it("should clone", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        const newSimpleData = simpleData.clone()
        assert.deepEqual(data, newSimpleData.getData())
    })

    it("should return an array", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const simpleData = new SimpleData({ data: data })
        const array = simpleData.getArray({ key: "patate" })
        assert.deepEqual(array, [1, 11, 111])
    })

    it("should return unique values", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 111, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const simpleData = new SimpleData({ data: data })
        const uniqueValues = simpleData.getUniqueValues({ key: "patate" })
        assert.deepEqual(uniqueValues, [1, 111])
    })

    it("should check values", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.checkValues({ overwrite: true })
        assert.deepEqual(simpleData.getData(), [
            {
                count: 2,
                key: 'patate',
                number: 0,
                string: [2, '100.00%'],
                uniques: [2, '100.00%']
            },
            {
                count: 2,
                key: 'poil',
                number: [2, '100.00%'],
                string: 0,
                uniques: [2, '100.00%']
            }
        ])
    })

    it("should describe", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.describe({ overwrite: true })
        assert.deepEqual(simpleData.getData(), [{
            nbDataPoints: 4,
            nbItems: 2,
            nbKeys: 2
        }])
    })

    it("should summarize", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.summarize({ overwrite: true })
        assert.deepEqual(simpleData.getData(), [{
            value: 'poil',
            count: 2,
            min: 2,
            max: 22,
            sum: 24,
            mean: 12,
            median: 12,
            deviation: 14.1
        }])

    })

    it("should exclude missing values", function () {
        const data = [
            { patate: null, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.excludeMissingValues()
        assert.deepEqual(simpleData.getData(), [{ patate: 11, poil: 22 }])
    })

    it("should rename key", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.renameKey({ oldKey: "patate", newKey: "navet" })
        assert.deepEqual(simpleData.getData(), [
            { navet: 1, poil: 2 },
            { navet: 11, poil: 22 },
        ])
    })

    it("should remove key", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.removeKey({ key: "patate" })
        assert.deepEqual(simpleData.getData(), [
            { poil: 2 },
            { poil: 22 },
        ])
    })

    it("should add key", function () {
        const data = [
            { patate: 1 },
            { patate: 11 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.addKey({ key: "poil", valueGenerator: item => item.patate as number * 2 })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 }
        ])
    })

    it("should select keys", function () {
        const data = [
            { patate: 1, poil: 2, peanut: 3 },
            { patate: 11, poil: 22, peanut: 33 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.selectKeys({ keys: ["poil", "peanut"] })
        assert.deepEqual(simpleData.getData(), [
            { poil: 2, peanut: 3 },
            { poil: 22, peanut: 33 },
        ])
    })

    it("should modify values", function () {
        const data = [
            { patate: 1 },
            { patate: 11 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.modifyValues({ key: "patate", valueGenerator: item => item as number * 2 })
        assert.deepEqual(simpleData.getData(), [
            { patate: 2 },
            { patate: 22 },
        ])
    })

    it("should modify items", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.modifyItems({
            key: "patate",
            itemGenerator: item => (item.patate as number) + (item.poil as number)
        })
        assert.deepEqual(simpleData.getData(), [
            { poil: 2, patate: 3 },
            { poil: 22, patate: 33 },
        ])
    })

    it("should format keys", function () {
        const data = [
            { patate_poil: 1 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.formatAllKeys()
        assert.deepEqual(simpleData.getData(), [
            { patatePoil: 1 },
        ])
    })

    it("should convert values to string", function () {
        const data = [
            { patate: 1, poil: 2 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.valuesToString({ key: "patate" })
        assert.deepEqual(simpleData.getData(), [
            { patate: "1", poil: 2 },
        ])
    })

    it("should convert values to integer", function () {
        const data = [
            { patate: "1", poil: 2 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.valuesToInteger({ key: "patate" })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2 },
        ])
    })

    it("should convert values to float", function () {
        const data = [
            { patate: "1", poil: 2 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.valuesToFloat({ key: "patate" })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1.0, poil: 2 },
        ])
    })

    it("should convert values to date", function () {
        const format = "%Y-%m-%d"
        const data = [
            { patate: "2022-02-03", poil: 2 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.valuesToDate({ key: "patate", format })
        assert.deepEqual(simpleData.getData(), [
            { patate: utcParse(format)("2022-02-03"), poil: 2 },
        ])
    })

    it("should convert date to string", function () {
        const format = "%Y-%m-%d"
        const data = [
            { patate: utcParse(format)("2022-02-03"), poil: 2 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.datesToString({ key: "patate", format })
        assert.deepEqual(simpleData.getData(), [
            { patate: "2022-02-03", poil: 2 },
        ])
    })

    it("should filter values", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.filterValues({ key: "patate", valueComparator: val => val as number >= 10 })
        assert.deepEqual(simpleData.getData(), [
            { patate: 11, poil: 22 },
        ])
    })

    it("should filter items", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.filterItems({
            itemComparator: val => val.patate as number >= 10 && val.poil as number >= 200
        })
        assert.deepEqual(simpleData.getData(), [
            { patate: 111, poil: 222 },
        ])
    })

    it("should round values", function () {
        const data = [
            { patate: 1.1111, poil: 2 },
            { patate: 11.1111, poil: 22 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.roundValues({ key: "patate", nbDigits: 2 })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1.11, poil: 2 },
            { patate: 11.11, poil: 22 },
        ])

    })

    it("should replace values", function () {
        const data = [
            { patate: "I am potato", poil: "I am poil" }
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.replaceValues({ key: "patate", oldValue: "I am", newValue: "You are", method: "partialString" })
        assert.deepEqual(simpleData.getData(), [
            { patate: "You are potato", poil: "I am poil" }
        ])

    })

    it("should sort values", function () {
        const data = [
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
            { patate: 1, poil: 2 }
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.sortValues({ key: "patate", order: "descending" })
        assert.deepEqual(simpleData.getData(), [
            { patate: 111, poil: 222 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 2 }
        ])
    })

    it("should add quantiles", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
            { patate: 1111, poil: 2222 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.addQuantiles({ key: "patate", newKey: "quantile", nbQuantiles: 2 })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2, quantile: 1 },
            { patate: 11, poil: 22, quantile: 1 },
            { patate: 111, poil: 222, quantile: 2 },
            { patate: 1111, poil: 2222, quantile: 2 },
        ])
    })

    it("should add bins", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
            { patate: 1111, poil: 2222 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.addBins({ key: "patate", newKey: "bin", nbBins: 2 })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2, bin: 1 },
            { patate: 11, poil: 22, bin: 1 },
            { patate: 111, poil: 222, bin: 1 },
            { patate: 1111, poil: 2222, bin: 2 },
        ])
    })

    it("should add outliers", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 },
            { patate: 11111, poil: 2222 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.addOutliers({ key: "patate", newKey: "outliers" })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2, outliers: false },
            { patate: 11, poil: 22, outliers: false },
            { patate: 1, poil: 222, outliers: false },
            { patate: 11111, poil: 2222, outliers: true },
        ])
    })

    it("should exclude outliers", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 },
            { patate: 11111, poil: 2222 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.excludeOutliers({ key: "patate" })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 }
        ])
    })

    it("should apply correlation", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 }
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.correlation({ key1: "patate", key2: "poil", overwrite: true }) 
        assert.deepEqual(simpleData.getData(), [{
            correlation: 1,
            key1: "patate",
            key2: "poil"
        }])
    })

    it("should add items", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const dataToBeAdded = [
            { patate: 1, poil: 222 }
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.addItems({ dataToBeAdded })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 }
        ])
    })


    it("should add items", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
        ]
        const dataToBeAdded = [
            { patate: 1, poil: 222 }
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.addItems({ dataToBeAdded })
        assert.deepEqual(simpleData.getData(), [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 }
        ])
    })

    it("should merge items", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const dataToBeMerged = [
            { patate: "1", peanut: 3 },
            { patate: "11", peanut: 33 },
        ]
        const simpleData = new SimpleData({ data: data })
        simpleData.mergeItems({ dataToBeMerged, commonKey: "patate" })
        // TODO: is this the expected behaviour with strings?
        assert.deepEqual(simpleData.getData(), [
            { patate: "1", poil: 2, peanut: 3 },
            { patate: "11", poil: 22, peanut: 33 },
        ])
    })

    it("should save data", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const encoding = "utf8"
        const simpleData = new SimpleData({ data: data })
        temporaryDirectoryTask((tempPath: string) => {
            const filePath = `${tempPath}/test.csv`
            simpleData.saveData({ path: filePath, encoding })

            const csvString = fs.readFileSync(filePath).toString()
            const csvData = papaparse.parse(csvString)

            assert.deepEqual(data, csvData)
        })
    })

})

