import { SimpleDataItem } from "../../types/SimpleData.types.js"
import camelCase from "lodash.camelcase"
import { log } from "../../exports/helpers.js"

export default function formatAllKeys(
    data: SimpleDataItem[],
    formatKey?: (key: string) => string,
    verbose = false
): SimpleDataItem[] {
    const keysToChange = []

    for (let i = 0; i < data.length; i++) {
        const d = data[i]

        if (i === 0) {
            const keys = Object.keys(d)
            const formattedKeys =
                typeof formatKey === "function"
                    ? keys.map((d) => formatKey(d))
                    : keys.map((d) => camelCase(d))

            for (let j = 0; j < keys.length; j++) {
                if (keys[j] !== formattedKeys[j]) {
                    verbose &&
                        log(
                            `=> ${keys[j]} changed to ${formattedKeys[j]}`,
                            "blue"
                        )
                    keysToChange.push({
                        oldKey: keys[j],
                        newKey: formattedKeys[j],
                    })
                }
            }
        }

        for (let k = 0; k < keysToChange.length; k++) {
            const oldKey = keysToChange[k].oldKey
            const newKey = keysToChange[k].newKey
            d[newKey] = d[oldKey]
            delete d[oldKey]
        }
    }

    return data
}
