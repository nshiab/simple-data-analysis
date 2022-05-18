import assert from "assert"
import * as fs from 'fs'
import papaparse from "papaparse"
import { temporaryDirectoryTask } from 'tempy'
import { utcParse } from "d3-time-format"
import { SimpleData } from "../../src/index.js"

describe('SimpleData', function () {
    it('should instantiate', function () {
        const data = [{patate: 1, poil: 2}]
        const simpleData = new SimpleData(data)
        assert.equal(data, simpleData.data)
    })

    it("should clone", function () {
        const data = [{patate: 1, poil: 2}]
        const simpleData = new SimpleData(data)
        const newSimpleData = simpleData.clone()
        assert.deepEqual(data, newSimpleData.data)
    })

    it("should return an array", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 111, poil: 222},
        ]
        const simpleData = new SimpleData(data)
        const array = simpleData.getArray("patate")
        assert.deepEqual(array, [1, 11, 111])
    })

    it("should return unique values", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 111, poil: 22},
            {patate: 111, poil: 222},
        ]
        const simpleData = new SimpleData(data)
        const uniqueValues = simpleData.getUniqueValues("patate")
        assert.deepEqual(uniqueValues, [1, 111])
    })

    it("should exclude missing values", function () {
        const data = [
            {patate: null, poil: 2},
            {patate: 11, poil: 22}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.excludeMissingValues()
        assert.deepEqual(simpleData.data, [{patate: 11, poil: 22}])
    })

    it("should rename key", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.renameKey("patate", "navet")
        assert.deepEqual(simpleData.data, [
            {navet: 1, poil: 2},
            {navet: 11, poil: 22}, 
        ])
    })

    it("should remove key", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.removeKey("patate")
        assert.deepEqual(simpleData.data, [
            {poil: 2},
            {poil: 22}, 
        ])
    })

    it("should add key", function () {
        const data = [
            {patate: 1},
            {patate: 11}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.addKey("poil", item => item.patate * 2)
        assert.deepEqual(simpleData.data, [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22}
        ])
    })

    it("should select keys", function () {
        const data = [
            {patate: 1, poil: 2, peanut: 3},
            {patate: 11, poil: 22, peanut: 33}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.selectKeys(["poil", "peanut"])
        assert.deepEqual(simpleData.data,  [
            {poil: 2, peanut: 3},
            {poil: 22, peanut: 33}, 
        ])
    })

    it("should modify values", function () {
        const data = [
            {patate: 1},
            {patate: 11}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.modifyValues("patate", item => item * 2)
        assert.deepEqual(simpleData.data, [
            {patate: 2},
            {patate: 22}, 
        ])
    })

    it("should modify items", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22}, 
        ]
        const simpleData = new SimpleData(data)
        simpleData.modifyItems("patate", item => item.patate + item.poil)
        assert.deepEqual(simpleData.data, [
            {poil: 2, patate: 3},
            {poil: 22, patate: 33}, 
        ])
    })

    it("should format keys", function () {
        const data = [
            {patate_poil: 1},
        ]
        const simpleData = new SimpleData(data)
        simpleData.formatAllKeys()
        assert.deepEqual(simpleData.data, [
            {patatePoil: 1},
        ])
    })

    it("should convert values to string", function () {
        const data = [
            {patate: 1, poil: 2},
        ]
        const simpleData = new SimpleData(data)
        simpleData.valuesToString("patate")        
        assert.deepEqual(simpleData.data, [
            {patate: "1", poil: 2},
        ])
    })

    it("should convert values to integer", function () {
        const data = [
            {patate: "1", poil: 2},
        ]
        const simpleData = new SimpleData(data)
        simpleData.valuesToInteger("patate")        
        assert.deepEqual(simpleData.data, [
            {patate: 1, poil: 2},
        ])
    })

    it("should convert values to float", function () {
        const data = [
            {patate: "1", poil: 2},
        ]
        const simpleData = new SimpleData(data)
        simpleData.valuesToFloat("patate")        
        assert.deepEqual(simpleData.data, [
            {patate: 1.0, poil: 2},
        ])
    })

    it("should convert values to date", function () {
        const format = "%Y-%m-%d"
        const data = [
            {patate: "2022-02-03", poil: 2},
        ]
        const simpleData = new SimpleData(data)
        simpleData.valuesToDate("patate", format)        
        assert.deepEqual(simpleData.data, [
            {patate: utcParse(format)("2022-02-03") , poil: 2},
        ])
    })

    it("should convert date to string", function () {
        const format = "%Y-%m-%d"
        const data = [
            {patate: utcParse(format)("2022-02-03"), poil: 2},
        ]
        const simpleData = new SimpleData(data)
        simpleData.datesToString("patate", format)        
        assert.deepEqual(simpleData.data, [
            {patate: "2022-02-03" , poil: 2},
        ])
    })

    it("should filter values", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
        ]
        const simpleData = new SimpleData(data)
        simpleData.filterValues("patate", val => val >= 10)      
        assert.deepEqual(simpleData.data, [
            {patate: 11, poil: 22},
        ])
    })

    it("should filter items", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 111, poil: 222},
        ]
        const simpleData = new SimpleData(data)
        simpleData.filterItems(val => val.patate >= 10 && val.poil >= 200)      
        assert.deepEqual(simpleData.data, [
            {patate: 111, poil: 222},
        ])
    })

    it("should round values", function () {
        const data = [
            {patate: 1.1111, poil: 2},
            {patate: 11.1111, poil: 22},
        ]
        const simpleData = new SimpleData(data, { fractionDigits: 2 })
        simpleData.roundValues("patate")
        assert.deepEqual(simpleData.data, [
            {patate: 1.11, poil: 2},
            {patate: 11.11, poil: 22},
        ])
    
    })

    it("should replace values", function () {
        const data = [
            {patate: "I am potato", poil: "I am poil"}
        ]
        const simpleData = new SimpleData(data)
        simpleData.replaceValues("patate", "I am", "You are", "partialString")
        assert.deepEqual(simpleData.data, [
            {patate: "You are potato", poil: "I am poil"}
        ])
    
    })

    it("should sort values", function () {
        const data = [
            {patate: 11, poil: 22},
            {patate: 111, poil: 222},
            {patate: 1, poil: 2}
        ]
        const simpleData = new SimpleData(data)
        simpleData.sortValues("patate", "descending")
        assert.deepEqual(simpleData.data, [
            {patate: 111, poil: 222},
            {patate: 11, poil: 22},
            {patate: 1, poil: 2}
        ])
    })

    it("should add quantiles", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 111, poil: 222},
            {patate: 1111, poil: 2222},
        ]
        const simpleData = new SimpleData(data)
        simpleData.addQuantiles("patate", "quantile", 2)
        // TODO: Fix this! This should not be the expected behaviour!
        assert.deepEqual(simpleData.data, [
            {patate: 1, poil: 2, quantile: 2},
            {patate: 11, poil: 22, quantile: 2},
            {patate: 111, poil: 222, quantile: 1},
            {patate: 1111, poil: 2222, quantile: 1},
        ])
    })

    it("should add bins", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 111, poil: 222},
            {patate: 1111, poil: 2222},
        ]
        const simpleData = new SimpleData(data)
        simpleData.addBins("patate", "bin", 2)
        // TODO: Fix this! This should not be the expected behaviour!
        assert.deepEqual(simpleData.data, [
            {patate: 1, poil: 2, bin: 1},
            {patate: 11, poil: 22, bin: 1},
            {patate: 111, poil: 222, bin: 1},
            {patate: 1111, poil: 2222, bin: 2},
        ])
    })

    it("should add outliers", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 1, poil: 222},
            {patate: 11111, poil: 2222},
        ]
        const simpleData = new SimpleData(data)
        simpleData.addOutliers("patate", "outliers")        
        assert.deepEqual(simpleData.data, [
            {patate: 1, poil: 2, outliers: false},
            {patate: 11, poil: 22, outliers: false},
            {patate: 1, poil: 222, outliers: false},
            {patate: 11111, poil: 2222, outliers: true},
        ])
    })

    it("should exclude outliers", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 1, poil: 222},
            {patate: 11111, poil: 2222},
        ]
        const simpleData = new SimpleData(data)
        simpleData.excludeOutliers("patate")        
        assert.deepEqual(simpleData.data, [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 1, poil: 222}
        ])
    })

    it("should apply correlation", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 1, poil: 222}
        ]
        const simpleData = new SimpleData(data)
        simpleData.correlation("patate", "poil")    
        // TODO: is this the expected behaviour?    
        assert.deepEqual(simpleData.data, [{
            correlation: -0.4,
            key1: "patate",
            key2: "poil"     
        }])
    })

    it("should add items", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
        ]
        const dataToBeAdded = [
            {patate: 1, poil: 222}
        ]
        const simpleData = new SimpleData(data)
        simpleData.addItems(dataToBeAdded)     
        assert.deepEqual(simpleData.data, [            
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 1, poil: 222}
        ])
    })


    it("should add items", function () {
        const data = [
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
        ]
        const dataToBeAdded = [
            {patate: 1, poil: 222}
        ]
        const simpleData = new SimpleData(data)
        simpleData.addItems(dataToBeAdded)     
        assert.deepEqual(simpleData.data, [            
            {patate: 1, poil: 2},
            {patate: 11, poil: 22},
            {patate: 1, poil: 222}
        ])
    })

    it("should merge items", function () {
        const data = [
            {patate: "1", poil: 2},
            {patate: "11", poil: 22},
        ]
        const dataToBeMerged = [
            {patate: "1", peanut: 3},
            {patate: "11", peanut: 33},
        ]
        const simpleData = new SimpleData(data)
        simpleData.mergeItems(dataToBeMerged, "patate")     
        // TODO: is this the expected behaviour with strings?
        assert.deepEqual(simpleData.data, [    
            {patate: "1", poil: 2, peanut: 3},
            {patate: "11", poil: 22, peanut: 33},
        ])
    })

    it("should summarize", function () {
        const data = [
            {patate: "1", poil: 2},
            {patate: "11", poil: 22},
        ]
        const simpleData = new SimpleData(data)
        simpleData.summarize()
        assert.deepEqual(simpleData.data, [{
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

    it("should save data", function () {
        const data = [
            {patate: "1", poil: 2},
            {patate: "11", poil: 22},
        ]
        const encoding = "utf8"
        const simpleData = new SimpleData(data, { encoding, environment: "nodejs" })
        temporaryDirectoryTask((tempPath: string) => {
            const filePath = `${tempPath}/test.csv`
            simpleData.saveData(filePath)

            const csvString = fs.readFileSync(filePath).toString()
            const csvData = papaparse.parse(csvString)

            assert.deepEqual(data, csvData)
        })        
    })

})

