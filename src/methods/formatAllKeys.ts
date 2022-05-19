import { SimpleDataItem } from "../types/SimpleData.types.js"
import camelCase from "lodash.camelcase"
import log from "../helpers/log.js"

export default function formatAllKeys(data: SimpleDataItem[], verbose: boolean): SimpleDataItem[] {

    const keysToChange = []

    for (let i = 0; i < data.length; i++) {

        const d = data[i]

        if (i === 0) {

            const keys = Object.keys(d)
            const camelCasedKeys = keys.map(d => camelCase(d))

            for (let j = 0; j < keys.length; j++) {
                if (keys[j] !== camelCasedKeys[j]) {
                    verbose && log(`=> ${keys[j]} changed to ${camelCasedKeys[j]}`, "blue")
                    keysToChange.push({ oldKey: keys[j], newKey: camelCasedKeys[j] })
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