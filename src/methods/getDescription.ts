import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import getDescriptionQuery from "./getDescriptionQuery.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getDescription(simpleWebTable: SimpleWebTable) {
    const types = await simpleWebTable.getTypes()

    const { query, extraData } = getDescriptionQuery(simpleWebTable.name, types)

    const queryResult = await queryDB(
        simpleWebTable,
        query,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            method: "getDescription()",
            parameters: {},
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

    simpleWebTable.debug && console.log("description:", description)

    return description
}
