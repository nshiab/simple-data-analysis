import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"
import getDescriptionQuery from "./getDescriptionQuery.js"

export default async function getDescription(
    simpleDB: SimpleDB,
    table: string,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetDescription()")

    const types = await simpleDB.getTypes(table)

    const { query, extraData } = getDescriptionQuery(table, types)

    const queryResult = await queryDB(
        simpleDB,
        query,
        mergeOptions(simpleDB, {
            ...options,
            table,
            nbRowsToLog: Infinity,
            returnDataFrom: "query",
        })
    )

    const description = [extraData].concat(
        queryResult
            ? queryResult.sort((a, b) => {
                  if (
                      typeof a["_"] === "string" &&
                      typeof b["_"] === "string"
                  ) {
                      return a["_"].localeCompare(b["_"])
                  } else {
                      return 0
                  }
              })
            : []
    )

    ;(options.debug || simpleDB.debug) &&
        console.log("\ndescription:", description)

    return description
}
