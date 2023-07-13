import { log, parseDataFile } from "../../exports/helpers.js"
import AdmZip from "adm-zip"
import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default async function loadDataFromStatsCan(
    pid: string,
    lang: "en" | "fr" = "en",
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
    if (pid.length > 8) {
        verbose &&
            log(
                `pid ${pid} is too long (max 8 characters). Using ${pid.slice(
                    0,
                    8
                )} instead.`,
                "blue"
            )
        pid = pid.slice(0, 8)
    }

    const responseGetCSV = await fetch(
        `https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/${pid}/${lang}`
    )

    const zippedCsvUrl = await responseGetCSV.json()

    verbose && log(`Fetching ${zippedCsvUrl.object}`, "blue")

    const response = await fetch(zippedCsvUrl.object)
    const zipBuffer = Buffer.from(await response.arrayBuffer())

    // Unzip data and convert to utf8
    const zip = new AdmZip(zipBuffer)
    const zipEntries = zip.getEntries()

    const csvEntry = zipEntries.find((d) => d.entryName === `${pid}.csv`)

    if (csvEntry === undefined) {
        throw new Error(`No ${pid}.csv in the zipped file.`)
    }

    const csv = csvEntry.getData().toString()

    return parseDataFile(
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
}
