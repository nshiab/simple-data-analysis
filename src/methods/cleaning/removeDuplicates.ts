import uniqBy from "lodash.uniqby"
import uniqWith from "lodash.uniqwith"
import isEqual from "lodash.isequal"

import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function removeDuplicates(
    data: SimpleDataItem[],
    key?: string,
    verbose?: boolean
) {
    let result: SimpleDataItem[]
    if (key === undefined) {
        result = uniqWith(data, isEqual)
    } else {
        const uniqueKeys = helpers.getUniqueKeys(data)
        if (!uniqueKeys.includes(key)) {
            throw new Error(`${key} key is not present in data.`)
        }
        result = uniqBy(data, key)
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
