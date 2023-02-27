import uniqBy from "lodash.uniqby"
import uniqWith from "lodash.uniqwith"
import isEqual from "lodash.isequal"
import { SimpleDataItem } from "../../types/SimpleData.types"
import log from "../../helpers/log.js"
import toPercentage from "../../helpers/toPercentage.js"
import hasKey from "../../helpers/hasKey.js"

export default function removeDuplicates(
    data: SimpleDataItem[],
    key?: string,
    keepDuplicatesOnly = false,
    nbToKeep = 1,
    verbose?: boolean
) {
    let result: SimpleDataItem[] = []

    if (!keepDuplicatesOnly) {
        verbose &&
            log(
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
                if (!hasKey(data, key)) {
                    throw new Error(`${key} key is not present in data.`)
                }
                for (let i = 0; i < data.length; i++) {
                    if (
                        data.filter((d) => isEqual(data[i][key], d[key]))
                            .length === 1
                    ) {
                        result.push(data[i])
                    }
                }
            }
        } else if (nbToKeep === 1) {
            if (key === undefined) {
                result = uniqWith(data, isEqual)
            } else {
                if (!hasKey(data, key)) {
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
            log(
                `/!\\ Removed ${nbRemoved} duplicate items, representing ${toPercentage(
                    nbRemoved,
                    data.length
                )} of received items.`,
                "bgRed"
            )
    } else {
        const duplicates: SimpleDataItem[] = []
        if (key === undefined) {
            for (let i = 0; i < data.length; i++) {
                if (data.filter((d) => isEqual(data[i], d)).length > 1) {
                    duplicates.push(data[i])
                }
            }
        } else {
            if (!hasKey(data, key)) {
                throw new Error(`${key} key is not present in data.`)
            }
            for (let i = 0; i < data.length; i++) {
                if (
                    data.filter((d) => isEqual(data[i][key], d[key])).length > 1
                ) {
                    duplicates.push(data[i])
                }
            }
        }

        verbose &&
            log(
                key === undefined
                    ? `/!\\ Found ${
                          duplicates.length
                      } duplicate items, representing ${toPercentage(
                          duplicates.length,
                          data.length
                      )} of received items.`
                    : `/!\\ Found ${
                          duplicates.length
                      } duplicate items for key ${key}, representing ${toPercentage(
                          duplicates.length,
                          data.length
                      )} of received items.`,
                "bgRed"
            )

        return duplicates // result
    }

    return result
}
