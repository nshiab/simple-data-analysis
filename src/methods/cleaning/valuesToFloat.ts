import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function valuesToFloat(
    data: SimpleDataItem[],
    key: string,
    language: "fr" | "en" = "en"
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (language === "en") {
        for (let i = 0; i < data.length; i++) {
            const value = data[i][key] as string
            data[i][key] = parseFloat(value.replace(/,/g, ""))
        }
    } else if (language === "fr") {
        for (let i = 0; i < data.length; i++) {
            const value = data[i][key] as string
            data[i][key] = parseFloat(
                value
                    .replace(/ /g, "")
                    .replace(/\u00A0/g, "")
                    .replace(",", ".")
            )
        }
    } else {
        throw new Error("Unknown langage. Only en and fr are supported.")
    }

    return data
}
