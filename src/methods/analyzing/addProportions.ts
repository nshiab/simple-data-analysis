import { flatRollup, sum } from "d3-array"
import { SimpleDataItem } from "../../types/SimpleData.types"
import { hasKey, checkTypeOfKey, log, round } from "../../exports/helpers.js"

export default function addProportions(
    data: SimpleDataItem[],
    options: {
        method: "item" | "data"
        keys?: string[]
        key?: string
        newKey?: string
        keyCategory?: string | string[]
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
            hasKey(data, key)
            hasKey(data, key + suffix, true)
            checkTypeOfKey(data, key, "number", 1, nbTestedValues)
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
        if (options.keyCategory !== undefined) {
            console.log(
                "Warning: with the method 'item', you don't need the parameter keyCategory."
            )
        }

        for (let i = 0; i < data.length; i++) {
            let total = 0
            for (const key of options.keys) {
                total += data[i][key] as number
            }
            for (const key of options.keys) {
                data[i][key + suffix] = round(
                    (data[i][key] as number) / total,
                    nbDigits
                )
            }
        }
    } else if (options.method === "data") {
        if (options.key === undefined) {
            throw new Error(
                "key is undefined. You need to specify on which key the proportions will be calculated."
            )
        }

        hasKey(data, options.key)
        checkTypeOfKey(data, options.key, "number", 1, nbTestedValues)
        options.newKey && hasKey(data, options.newKey, true)

        const keyCategory =
            options.keyCategory === undefined
                ? []
                : Array.isArray(options.keyCategory)
                ? options.keyCategory
                : [options.keyCategory]

        for (const key of keyCategory) {
            hasKey(data, key)
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

        if (keyCategory.length === 0) {
            let total = 0
            for (let i = 0; i < data.length; i++) {
                total += data[i][options.key] as number
            }
            for (let i = 0; i < data.length; i++) {
                data[i][
                    options.newKey as string /*we are testing undefined with hasKey above*/
                ] = round((data[i][options.key] as number) / total, nbDigits)
            }
        } else {
            const keyCategoryFunc = keyCategory.map(
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
                ...keyCategoryFunc
            )

            const totalValueIndex = keyCategory.length

            for (let i = 0; i < data.length; i++) {
                const total = totals.find((total) => {
                    let test = true
                    for (let j = 0; j < keyCategory.length; j++) {
                        if (data[i][keyCategory[j]] !== total[j]) {
                            test = false
                            break
                        }
                    }
                    return test
                })
                if (total) {
                    const totalValue = total[totalValueIndex] as number
                    data[i][
                        options.newKey as string /*we are testing undefined with hasKey above*/
                    ] = round(
                        (data[i][options.key] as number) / totalValue,
                        nbDigits
                    )
                } else {
                    data[i][
                        options.newKey as string /*we are testing undefined with hasKey above*/
                    ] === undefined
                }
            }
        }
    } else {
        throw new Error(`Unknown method ${options.method}`)
    }

    return data
}
