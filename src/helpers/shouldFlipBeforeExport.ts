import SimpleWebTable from "../class/SimpleWebTable.js"

export default function shouldFlipBeforeExport(simpleWebTable: SimpleWebTable) {
    return (simpleWebTable.projection ?? "").includes("proj=latlong")
}
