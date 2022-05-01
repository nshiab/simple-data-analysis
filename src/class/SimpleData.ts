import describe_ from "../methods/describe.js"
import { ArrayOfObjects, Options } from "../types.js"

export default class SimpleData {

    data: ArrayOfObjects
    keys: string[]

    constructor(incomingData: ArrayOfObjects, columns: string[]) {
        this.data = incomingData
        this.keys = columns
    }

    describe(options: Options) {
        describe_(this.data, options)
    }

}