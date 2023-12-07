import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"
import getDescriptionQuery from "./getDescriptionQuery.js"

export default async function getDescription(
    simpleDB: SimpleDB,
    table: string
) {
    simpleDB.debug && console.log("\ngetDescription()")
    simpleDB.debug && console.log("parameters:", { table })

    const types = await simpleDB.getTypes(table)

    const { query, extraData } = getDescriptionQuery(table, types)

    const queryResult = await queryDB(
        simpleDB,
        query,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("\ndescription:", description)

    return description
}
