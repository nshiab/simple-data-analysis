import uniqBy from "lodash.uniqby"
import uniqWith from "lodash.uniqwith"
import isEqual from "lodash.isequal"

import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function removeDuplicates(
    data: SimpleDataItem[],
    key?: string,
    nbToKeep = 1,
    verbose?: boolean
) {
    let result: SimpleDataItem[] = []

    verbose &&
        helpers.log(
            "The nbToKeep is set to " +
                nbToKeep +
                ". If 0, no duplicates will be kept in the data. If 1, the first one found will be kept in the data."
        )

    if (nbToKeep === 0) {
        if (key === undefined) {
            for (let i = 0; i < data.length; i++) {
                if (data.filter((d) => isEqual(data[i], d)).length === 1) {
                    result.push(data[i])
                }
            }
        } else {
            if (!helpers.hasKey(data[0], key)) {
                throw new Error(`${key} key is not present in data.`)
            }
            for (let i = 0; i < data.length; i++) {
                if (
                    data.filter((d) => isEqual(data[i][key], d[key])).length ===
                    1
                ) {
                    result.push(data[i])
                }
            }
        }
    } else if (nbToKeep === 1) {
        if (key === undefined) {
            result = uniqWith(data, isEqual)
        } else {
            if (!helpers.hasKey(data[0], key)) {
                throw new Error(`${key} key is not present in data.`)
            }
            result = uniqBy(data, key)
        }
    } else if (nbToKeep > 1) {
        throw new Error(
            "nbToKeep can either be 0 or 1. If 0, no duplicates will be kept in the data. If 1, the first one found will be kept in the data."
        )
    }

    const nbRemoved = data.length - result.length
    verbose &&
        helpers.log(
            `/!\\ Removed ${nbRemoved} duplicate items, representing ${helpers.toPercentage(
                nbRemoved,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return result
}
