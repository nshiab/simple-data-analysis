import { load } from "cheerio"
import { SimpleDataItem, SimpleDataValue } from "../../types/SimpleData.types"

export default async function loadDataFromHtmlTable(
    url: string,
    tableSelector?: string,
    tableNumber?: number
    /*
    autoType = false,
    firstItem = 0,
    lastItem = Infinity,
    nbFirstRowsToExclude = 0,
    nbLastRowsToExclude = Infinity,
    fillMissingKeys = false,
    missingKeyValues: SimpleDataItem = {
        null: null,
        NaN: NaN,
        undefined: undefined,
    },
    headers: undefined | string[] = undefined,
    
    verbose = false*/
) {
    const response = await fetch(url)
    const html = await response.text()

    const $ = load(html)

    let table

    if (typeof tableSelector === "string") {
        table = $(tableSelector).filter(
            (i) => i === (typeof tableNumber === "number" ? tableNumber : 0)
        )
    } else {
        table = $("table").filter(
            (i) => i === (typeof tableNumber === "number" ? tableNumber : 0)
        )
    }

    const keys: string[] = []
    const data: SimpleDataItem[] = []

    table.find("tr").each((i, tr) => {
        if (i === 0) {
            $(tr)
                .find("th, td")
                .each((j, th) => {
                    keys.push($(th).text().trim())
                })
        } else {
            $(tr)
                .find("th, td")
                .each((j, td) => {
                    const item: { [key: string]: SimpleDataValue } = {}
                    item[keys[j]] = $(td).text().trim()
                    data.push(item)
                })
        }
    })

    return data
}
