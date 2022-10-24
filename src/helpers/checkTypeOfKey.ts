import { SimpleDataItem } from "../types/SimpleData.types.js"
import log from "./log.js"
import toPercentage from "./toPercentage.js"

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
        log(
            `The key ${key} has ${data.length} values, but the type of only ${nbTested} is tested.`
        )
    const percentTested = toPercentage(nbTested, data.length)

    let foundType = 0

    if (type === "Date") {
        for (let i = 0; i < nbTested; i++) {
            if (data[i][key] instanceof Date) {
                foundType += 1
            } else if (
                data[i][key] instanceof Date === false &&
                threshold === 1
            ) {
                break
            }
        }
    } else {
        for (let i = 0; i < nbTested; i++) {
            if (typeof data[i][key] === type) {
                foundType += 1
            } else if (typeof data[i][key] !== type && threshold === 1) {
                break
            }
        }
    }
    const percentTest = foundType / nbTested
    const test = percentTest >= threshold
    if (!test) {
        if (threshold === 1) {
            verbose &&
                log(
                    `=> ${key} : at least one of the tested values (n=${nbTested} / ${percentTested} of data) is not a ${type} (threshold: ${threshold})`,
                    "blue"
                )
        } else {
            verbose &&
                log(
                    `=> ${key} : ${
                        (1 - percentTest) * 100
                    }% of tested values (n=${nbTested} / ${percentTested} of data) are not a ${type} (threshold: ${threshold})`,
                    "blue"
                )
        }
    }
    return test
}
