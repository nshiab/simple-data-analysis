import { SimpleDB } from "simple-data-analysis"

// We start a SimpleDB instance.
const sdb = new SimpleDB()

// We create a new table.
const provinces = sdb.newTable("provinces")
// We fetch the provinces' boundaries. It's a geoJSON.
await provinces.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json"
)
// We log the provinces.
await provinces.logTable()

// We create a new table.
const fires = sdb.newTable("fires")
// We fetch the wildfires data. It's a CSV.
await fires.loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv"
)
// We create point geometries from the lat and lon columns
// and we store the points in the new column geom.
await fires.points("lat", "lon", "geom")
// We log the fires.
await fires.logTable()

// We match fires with provinces
// and we output the results into a new table.
// By default, joinGeo will automatically look
// for columns storing geometries in the tables,
// do a left join, and put the results
// in the left table.
const firesInsideProvinces = await fires.joinGeo(provinces, "inside", {
    outputTable: "firesInsideProvinces",
})

// We summarize to count the number of fires
// and sum up the area burnt in each province.
await firesInsideProvinces.summarize({
    values: "hectares",
    categories: "nameEnglish",
    summaries: ["count", "sum"],
    decimals: 0,
})
// We rename columns.
await firesInsideProvinces.renameColumns({
    count: "nbFires",
    sum: "burntArea",
})
// We want the province with
// the greatest burnt area first.
await firesInsideProvinces.sort({ burntArea: "desc" })

// We log the results. By default, the method
// logs the first 10 rows, but there are 13
// provinces and territories in Canada.
await firesInsideProvinces.logTable(13)

// We can also log a bar chart.
await firesInsideProvinces.logBarChart("nameEnglish", "burntArea")

// We close everything.
await sdb.done()
