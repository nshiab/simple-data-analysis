import { flatRollup, sum } from "d3-array"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import hasKey from "../../helpers/hasKey.js"
import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function addProportions(
    data: SimpleDataItem[],
    options: {
        method: "item" | "data"
        keys?: string[]
        key?: string
        newKey?: string
        groupKeys?: string | string[]
        suffix?: string
        nbDigits?: number
        verbose?: boolean
        nbTestedValues?: number
    }
) {
    const nbDigits = options.nbDigits === undefined ? 2 : options.nbDigits
    const verbose = options.verbose === undefined ? false : options.verbose
    const nbTestedValues =
        options.nbTestedValues === undefined ? 10000 : options.nbTestedValues

    if (options.method === "item") {
        const suffix = options.suffix === undefined ? "Percent" : options.suffix

        if (options.keys === undefined || !Array.isArray(options.keys)) {
            throw new Error(
                "The parameter keys needs a list of keys, like so ['key1', 'key2'] to calculate the proportions."
            )
        }

        for (const key of options.keys) {
            if (!hasKey(data[0], key)) {
                throw new Error("No key " + key + " in the data.")
            }
            if (hasKey(data[0], key + suffix)) {
                throw new Error(
                    "Your suffix is " +
                        suffix +
                        ", but there's already a key " +
                        key +
                        suffix +
                        ". You need to choose another suffix."
                )
            }
            if (!checkTypeOfKey(data, key, "number", 0.5, nbTestedValues)) {
                throw new Error(
                    "The majority of values inside " + key + " are not numbers."
                )
            }
        }

        verbose &&
            log("The suffix used to create new keys is " + suffix + ".", "blue")

        if (options.key !== undefined) {
            console.log(
                "Warning: with the method 'item', you don't need the parameter key."
            )
        }
        if (options.newKey !== undefined) {
            console.log(
                "Warning: with the method 'item', you don't need the parameter newKey."
            )
        }
        if (options.groupKeys !== undefined) {
            console.log(
                "Warning: with the method 'item', you don't need the parameter groupKeys."
            )
        }

        for (let i = 0; i < data.length; i++) {
            let total = 0
            for (const key of options.keys) {
                total += data[i][key] as number
            }
            for (const key of options.keys) {
                data[i][key + suffix] = parseFloat(
                    ((data[i][key] as number) / total).toFixed(nbDigits)
                )
            }
        }
    } else if (options.method === "data") {
        if (options.key === undefined) {
            throw new Error(
                "key is undefined. You need to specify on which key the proportions will be calculated."
            )
        }
        if (!hasKey(data[0], options.key)) {
            throw new Error("No key named " + options.key + " in the data")
        }

        if (!checkTypeOfKey(data, options.key, "number", 0.5, nbTestedValues)) {
            throw new Error(
                "The majority of values inside " +
                    options.key +
                    " are not numbers."
            )
        }

        if (options.newKey === undefined) {
            throw new Error(
                "newKey is undefined. Give a name to the new key that will be created"
            )
        }
        if (hasKey(data[0], options.newKey)) {
            throw new Error(
                "Already an key named " + options.newKey + " in the data"
            )
        }

        const groupKeys =
            options.groupKeys === undefined
                ? []
                : Array.isArray(options.groupKeys)
                ? options.groupKeys
                : [options.groupKeys]

        for (const key of groupKeys) {
            if (!hasKey(data[0], key)) {
                throw new Error(
                    "The key " + key + " does not exist in the data."
                )
            }
        }

        if (options.keys !== undefined) {
            console.log(
                "Warning: with the method 'data', you don't need the parameter keys."
            )
        }
        if (options.suffix !== undefined) {
            console.log(
                "Warning: with the method 'data', you don't need the parameter suffix."
            )
        }

        if (groupKeys.length === 0) {
            let total = 0
            for (let i = 0; i < data.length; i++) {
                total += data[i][options.key] as number
            }
            for (let i = 0; i < data.length; i++) {
                data[i][options.newKey] = parseFloat(
                    ((data[i][options.key] as number) / total).toFixed(nbDigits)
                )
            }
        } else {
            const groupKeysFunc = groupKeys.map(
                (key) => (d: SimpleDataItem) => d[key]
            )

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const totals = flatRollup(
                data,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (v) => sum(v, (d) => d[options.key]),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ...groupKeysFunc
            )

            const totalValueIndex = groupKeys.length

            for (let i = 0; i < data.length; i++) {
                const total = totals.find((total) => {
                    let test = true
                    for (let j = 0; j < groupKeys.length; j++) {
                        if (data[i][groupKeys[j]] !== total[j]) {
                            test = false
                            break
                        }
                    }
                    return test
                })
                if (total) {
                    const totalValue = total[totalValueIndex] as number
                    data[i][options.newKey] = parseFloat(
                        ((data[i][options.key] as number) / totalValue).toFixed(
                            nbDigits
                        )
                    )
                } else {
                    data[i][options.newKey] === undefined
                }
            }
        }
    } else {
        throw new Error(`Unknown method ${options.method}`)
    }

    return data
}
