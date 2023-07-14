import { load } from "cheerio"
import { csvFormatRow } from "d3-dsv"
import parseDataFile from "../../helpers/parseDataFile.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import axios from "axios"

export default async function loadDataFromHtmlTableNode(
    url: string,
    tableSelector: string | undefined = undefined,
    tableIndex: number | undefined = undefined,
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
    verbose = false
) {
    const response = await axios.get(url)
    const html = response.data

    url.includes("ourcommons") && console.log(html)

    const $ = load(html)

    let table

    if (typeof tableSelector === "string") {
        table = $(tableSelector).filter(
            (i) => i === (typeof tableIndex === "number" ? tableIndex : 0)
        )
    } else {
        table = $("table").filter(
            (i) => i === (typeof tableIndex === "number" ? tableIndex : 0)
        )
    }

    let csv = ""

    table.find("tr").each((i, tr) => {
        const row: string[] = []

        $(tr)
            .find("th, td")
            .each((j, th) => {
                row.push($(th).text().trim())
            })

        csv += `${csvFormatRow(row)}\n`
    })

    const data = parseDataFile(
        csv,
        "csv",
        autoType,
        false,
        firstItem,
        lastItem,
        nbFirstRowsToExclude,
        nbLastRowsToExclude,
        fillMissingKeys,
        missingKeyValues,
        headers,
        verbose
    )

    return data
}
