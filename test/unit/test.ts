import assert from "assert"
import { SimpleData } from "../../src/index.js"

describe('SimpleData', function () {
    it('should instantiate properly', function () {
        const data =  [{patate: 0, poil: 1}]
        const simpleData = new SimpleData(
           data, 
            {
                encoding: "utf8",
                logs: false,
                logOptions: false,
                logParameters: false,
                nbItemInTable: 0,
                fractionDigits: 0,
                missingValues: [],
                missingValuesArray: [],
                nbValuesTestedForTypeOf: 0,
                environment: "node",
                showDataNoOverwrite: false
            }
        )

        assert(data === simpleData._data)
    
    })
})