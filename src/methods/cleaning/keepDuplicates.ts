import isEqual from "lodash.isequal"
import { SimpleDataItem } from "../../types/SimpleData.types"
import log from "../../helpers/log.js"
import getUniqueKeys from "../../helpers/getUniqueKeys.js"
import toPercentage from "../../helpers/toPercentage.js"

export default function keepDuplicates(
    data: SimpleDataItem[],
    key?: string,
    verbose?: boolean
) {
    const duplicates: SimpleDataItem[] = []
    if (key === undefined) {
        for (let i = 0; i < data.length; i++) {
            if (data.filter((d) => isEqual(data[i], d)).length > 1) {
                duplicates.push(data[i])
            }
        }
    } else {
        const uniqueKeys = getUniqueKeys(data)
        if (!uniqueKeys.includes(key)) {
            throw new Error(`${key} key is not present in data.`)
        }
        for (let i = 0; i < data.length; i++) {
            if (data.filter((d) => isEqual(data[i][key], d[key])).length > 1) {
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
