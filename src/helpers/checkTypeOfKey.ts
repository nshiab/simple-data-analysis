import { SimpleDataItem } from "../types/SimpleData.types.js"
import { log, toPercentage } from "../exports/helpers.js"

export default function checkTypeOfKey(
    data: SimpleDataItem[],
    key: string,
    type: string,
    threshold: number,
    nbTestedValues = 10000,
    verbose = false,
    noError = false
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
            const typeCheck =
                data[i][key] instanceof Date && !isNaN(data[i][key] as number) // in fact, it's a Date.
            if (typeCheck) {
                foundType += 1
            } else if (!typeCheck && threshold === 1) {
                if (noError) {
                    break
                } else {
                    throw new Error(
                        `${data[i][key]} in ${key} is not a valid Date.`
                    )
                }
            }
        }
    } else if (type === "number") {
        for (let i = 0; i < nbTested; i++) {
            const typeCheck =
                typeof data[i][key] === "number" && !Number.isNaN(data[i][key])
            if (typeCheck) {
                foundType += 1
            } else if (!typeCheck && threshold === 1) {
                if (noError) {
                    break
                } else {
                    throw new Error(
                        `${data[i][key]} in ${key} is not a valid number.`
                    )
                }
            }
        }
    } else if (type === "string") {
        for (let i = 0; i < nbTested; i++) {
            const typeCheck =
                typeof data[i][key] === "string" && data[i][key] !== ""
            if (typeCheck) {
                foundType += 1
            } else if (!typeCheck && threshold === 1) {
                if (noError) {
                    break
                } else {
                    throw new Error(
                        `${
                            data[i][key] === ""
                                ? "<empty string>"
                                : data[i][key]
                        } in ${key} is not a valid string.`
                    )
                }
            }
        }
    } else {
        for (let i = 0; i < nbTested; i++) {
            if (typeof data[i][key] === type) {
                foundType += 1
            } else if (typeof data[i][key] !== type && threshold === 1) {
                if (noError) {
                    break
                } else {
                    throw new Error(
                        `${data[i][key]} in ${key} is not a valid ${type}.`
                    )
                }
            }
        }
    }
    const percentTest = foundType / nbTested
    const message = `=> ${key} : ${
        (1 - percentTest) * 100
    }% of tested values (n=${nbTested} / ${percentTested} of data) are not a ${type} (threshold: ${threshold})`

    if (percentTest < threshold) {
        if (noError) {
            verbose && log(message)
            return false
        } else {
            throw new Error(message)
        }
    } else {
        return true
    }
}
