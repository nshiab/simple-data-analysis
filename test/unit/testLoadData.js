import assert from "assert"
import { loadData, SimpleData } from "../../dist/index.js"

describe('loadData', function () {
    it('should load data and return a SimpleData object', function (done) {
        loadData("data/employees.csv").then(
            simpleData => {
                assert(simpleData instanceof SimpleData)
                done()
            }
        ).catch(
            err => done(err)
        )
    })
})