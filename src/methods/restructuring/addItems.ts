import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import isEqual from "lodash.isequal"
import log from "../../helpers/log.js"
import SimpleData from "../../class/SimpleData.js"
import handleMissingKeys from "../../helpers/handleMissingKeys.js"
import getUniqueKeys from "../../helpers/getUniqueKeys.js"
import round from "../../helpers/round.js"

export default function addItems(
    data: SimpleDataItem[],
    dataToBeAdded: SimpleDataItem[] | SimpleData,
    fillMissingKeys?: boolean,
    defaultValue?: SimpleDataValue,
    verbose?: boolean
): SimpleDataItem[] {
    if (dataToBeAdded instanceof SimpleData) {
        dataToBeAdded = dataToBeAdded.getData()
    }

    let newData = data.concat(dataToBeAdded)

    const uniqueKeys = getUniqueKeys(data)
    const uniqueKeysToBeAdded = getUniqueKeys(dataToBeAdded)

    if (
        !fillMissingKeys &&
        !isEqual(uniqueKeys, uniqueKeysToBeAdded) &&
        data.length > 0
    ) {
        throw new Error(
            `data and dataToBeAdded don't have the same keys\ndata keys => ${String(
                uniqueKeys
            )}\ndataToBeAdded keys => ${String(uniqueKeysToBeAdded)}`
        )
    }

    const uniqueKeysCombined = [
        ...new Set([...uniqueKeys, ...uniqueKeysToBeAdded]),
    ].sort()

    newData = handleMissingKeys(newData, true, defaultValue, uniqueKeysCombined)

    verbose &&
        log(
            `/!\\ ${
                newData.length - data.length
            } items added. Number of items increased by ${round(
                ((newData.length - data.length) / data.length) * 100,
                1
            )}%`,
            "bgRed"
        )

    return newData
}
