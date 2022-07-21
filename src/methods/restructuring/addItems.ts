import isEqual from "lodash.isequal"

import { SimpleDataItem } from "../../types/index.js"
import SimpleData from "../../class/SimpleData.js"
import helpers from "../../helpers/index.js"

export default function addItems(
    data: SimpleDataItem[],
    dataToBeAdded: SimpleDataItem[] | SimpleData,
    fillMissingKeys?: boolean,
    verbose?: boolean
): SimpleDataItem[] {
    if (dataToBeAdded instanceof SimpleData) {
        dataToBeAdded = dataToBeAdded.getData()
    }

    const uniqueKeys = helpers.getUniqueKeys(data)
    dataToBeAdded = helpers.handleMissingKeys(
        dataToBeAdded,
        fillMissingKeys,
        uniqueKeys
    )

    const uniqueKeysToBeAdded = helpers.getUniqueKeys(dataToBeAdded)

    if (!isEqual(uniqueKeys, uniqueKeysToBeAdded)) {
        throw new Error(
            `data and dataToBeAdded don't have the same keys\ndata keys => ${String(
                uniqueKeys
            )}\ndataToBeAdded keys => ${String(uniqueKeysToBeAdded)}`
        )
    }

    const newData = data.concat(dataToBeAdded)
    verbose &&
        helpers.log(
            `/!\\ ${
                newData.length - data.length
            } items added. Number of items increased by ${(
                ((newData.length - data.length) / data.length) *
                100
            ).toFixed(1)}%`,
            "bgRed"
        )

    return newData
}
