import { SimpleDataItem } from "../../types/SimpleData.types.js"
import isEqual from "lodash.isequal"
import log from "../../helpers/log.js"
import SimpleData from "../../class/SimpleData.js"
import handleMissingKeys from "../../helpers/handleMissingKeys.js"
import getUniqueKeys from "../../helpers/getUniqueKeys.js"

export default function addItems(
    data: SimpleDataItem[],
    dataToBeAdded: SimpleDataItem[] | SimpleData,
    fillMissingKeys?: boolean,
    verbose?: boolean
): SimpleDataItem[] {
    if (dataToBeAdded instanceof SimpleData) {
        dataToBeAdded = dataToBeAdded.getData()
    }

    const uniqueKeys = getUniqueKeys(data)
    dataToBeAdded = handleMissingKeys(
        dataToBeAdded,
        fillMissingKeys,
        uniqueKeys
    )

    const uniqueKeysToBeAdded = getUniqueKeys(dataToBeAdded)

    if (!isEqual(uniqueKeys, uniqueKeysToBeAdded)) {
        throw new Error(
            `data and dataToBeAdded don't have the same keys\ndata keys => ${String(
                uniqueKeys
            )}\ndataToBeAdded keys => ${String(uniqueKeysToBeAdded)}`
        )
    }

    const newData = data.concat(dataToBeAdded)
    verbose &&
        log(
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
