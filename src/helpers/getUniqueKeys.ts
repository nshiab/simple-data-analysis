import { SimpleDataItem } from "../types/index.js"

export default function getUniqueKeys(data: SimpleDataItem[]): string[] {
    const uniqueKeys = Object.keys(
        data.reduce((prev, curr) => Object.assign(prev, curr), {})
    ).sort()

    return uniqueKeys
}
