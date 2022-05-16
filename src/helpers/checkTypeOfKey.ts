import { Options, SimpleDataItem } from "../types";
import log from "./log";
import percentage from "./percentage";


export default function checkTypeOfKey(data: SimpleDataItem[], key: string, type: string, threshold: number, options: Options): boolean {

    const nbTestedValues = data.length < options.nbValuesTestedForTypeOf ? data.length : options.nbValuesTestedForTypeOf
    options.logs && nbTestedValues < data.length && log(`The key ${key} has ${data.length} values, but the type of only ${nbTestedValues} is tested. You can increase it with .setDefaultOptions({nbValuesTestedForTypeOf : numberOfYourchoice})`)
    const percentTested = percentage(nbTestedValues, data.length, options)

    let foundType = 0
    for (let i = 0; i < nbTestedValues; i++) {
        if (typeof data[i][key] === type) {
            foundType += 1
        } else if (typeof data[i][key] !== type && threshold === 1) {
            break
        }
    }
    const percentTest = foundType / nbTestedValues
    const test = percentTest >= threshold
    if (!test) {
        if (threshold === 1) {
            options.logs && log(`=> ${key} : at least one of the tested values (n=${nbTestedValues} / ${percentTested} of data) is not a ${type} (threshold: ${threshold})`, "blue")
        } else {
            options.logs && log(`=> ${key} : ${(1 - percentTest) * 100}% of tested values (n=${nbTestedValues} / ${percentTested} of data) are not a ${type} (threshold: ${threshold})`, "blue")
        }

    }
    return test
}