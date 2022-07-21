import { SimpleDataItem } from "../types/index.js"
import helpers from "../helpers/index.js"

export default function checkTypeOfKey(
    data: SimpleDataItem[],
    key: string,
    type: string,
    threshold: number,
    nbTestedValues = 10000,
    verbose = false
): boolean {
    const nbTested = data.length < nbTestedValues ? data.length : nbTestedValues
    verbose &&
        nbTested < data.length &&
        helpers.log(
            `The key ${key} has ${data.length} values, but the type of only ${nbTested} is tested.`
        )
    const percentTested = helpers.toPercentage(nbTested, data.length)

    let foundType = 0
    for (let i = 0; i < nbTested; i++) {
        if (typeof data[i][key] === type) {
            foundType += 1
        } else if (typeof data[i][key] !== type && threshold === 1) {
            break
        }
    }
    const percentTest = foundType / nbTested
    const test = percentTest >= threshold
    if (!test) {
        if (threshold === 1) {
            verbose &&
                helpers.log(
                    `=> ${key} : at least one of the tested values (n=${nbTested} / ${percentTested} of data) is not a ${type} (threshold: ${threshold})`,
                    "blue"
                )
        } else {
            verbose &&
                helpers.log(
                    `=> ${key} : ${
                        (1 - percentTest) * 100
                    }% of tested values (n=${nbTested} / ${percentTested} of data) are not a ${type} (threshold: ${threshold})`,
                    "blue"
                )
        }
    }
    return test
}
