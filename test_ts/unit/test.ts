import { SimpleData } from "../../src/index"

describe('patate', function () {
    it('should poil', function (done) {
        new SimpleData(
            [{patate: 0, poil: 1}], 
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
        done()
    })
})