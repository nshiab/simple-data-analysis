import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"
import getDescriptionQuery from "./getDescriptionQuery.js"

export default async function getDescription(
    SimpleWebDB: SimpleWebDB,
    table: string
) {
    const types = await SimpleWebDB.getTypes(table)

    const { query, extraData } = getDescriptionQuery(table, types)

    const queryResult = await queryDB(
        SimpleWebDB,
        query,
        mergeOptions(SimpleWebDB, {
            table,
            method: "getDescription()",
            parameters: { table },
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

    SimpleWebDB.debug && console.log("description:", description)

    return description
}
