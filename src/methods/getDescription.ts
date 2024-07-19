import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getDescription(simpleWebTable: SimpleWebTable) {
    const types = await simpleWebTable.getTypes()
    const columns = await simpleWebTable.getColumns()
    const summaryForGetDescription = await simpleWebTable.summarize({
        values: columns,
        summaries: ["count", "countUnique", "countNull"],
        outputTable: "summaryForGetDescription",
    })
    const summaryData = await summaryForGetDescription.getData()

    await summaryForGetDescription.removeTable()

    const description = summaryData.map((d) => ({
        column: d["value"] as string,
        type: types[d["value"] as string],
        count: d["count"] as number,
        unique: d["countUnique"] as number,
        null: d["countNull"] as number,
    }))

    simpleWebTable.debug && console.log("description:", description)

    return description
}
