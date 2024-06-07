import SimpleWebTable from "../class/SimpleWebTable.js"

export default function (simpleWebTable: SimpleWebTable) {
    return (simpleWebTable.projection?.proj4 ?? "").includes("proj=latlong")
}
