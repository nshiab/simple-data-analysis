import { Options, SimpleDataItem } from "../types";
import log from "./log.js";
import percentage from "./percentage.js";


export default function checkTypeOfKey(data: SimpleDataItem[], key: string, type: string, options: Options): boolean {

    const nbTestedValues = data.length < options.nbValuesTestedForTypeOf ? data.length : options.nbValuesTestedForTypeOf
    const percentTested = percentage(nbTestedValues, data.length, options)

    let foundType = 0
    for (let i = 0; i < nbTestedValues; i++) {
        if (typeof data[i][key] === type) {
            foundType += 1
        }
    }
    const test = foundType / nbTestedValues > 0.5
    if (!test) {
        options.logs && log(`=> Majority of ${key} values are not ${type} (${nbTestedValues} first values tested / ${percentTested} of data)`, "blue")
    }
    return test
}