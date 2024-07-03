import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import SimpleTable from "../class/SimpleTable"
import crypto from "crypto"

type cacheSources = {
    [key: string]: {
        timestamp: number
        geo: boolean
    }
}

export default async function cache(
    table: SimpleTable,
    run: () => Promise<void>,
    options: { ttl?: number; verbose?: boolean } = {}
) {
    table.debug && console.log("\ncache()")

    const cachePath = "./.sda-cache"
    if (!existsSync(cachePath)) {
        table.debug && console.log(`Creating ${cachePath}`)
        mkdirSync(cachePath)
    }
    const cacheSourcesPath = `${cachePath}/sources.json`
    let cacheSources: cacheSources = {}
    if (existsSync(cacheSourcesPath)) {
        table.debug && console.log(`Found ${cacheSourcesPath}`)
        cacheSources = JSON.parse(readFileSync(cacheSourcesPath, "utf-8"))
    } else {
        table.debug && console.log(`No ${cacheSourcesPath}`)
    }

    const functionBody = run.toString()
    table.debug && console.log("Function body:", functionBody)
    const hash = crypto.createHash("sha256").update(functionBody).digest("hex")
    const id = `${table.name}.${hash}`

    table.debug && console.log("id:", id)
    const cache = cacheSources[id]

    if (cache === undefined) {
        ;(table.debug || options.verbose) &&
            console.log(`\nNothing in cache. Running and storing in cache.`)
        await runAndWrite(
            table,
            run,
            cacheSources,
            cacheSourcesPath,
            cachePath,
            id
        )
    } else if (
        cache &&
        typeof options.ttl === "number" &&
        Date.now() - cache.timestamp > options.ttl * 1000
    ) {
        ;(table.debug || options.verbose) &&
            console.log(
                `\nttl of ${options.ttl} sec has expired. Running and storing in cache.`
            )
        await runAndWrite(
            table,
            run,
            cacheSources,
            cacheSourcesPath,
            cachePath,
            id
        )
    } else {
        ;(table.debug || options.verbose) &&
            console.log(`\nLoading data from cache.`)
        if (cache.geo) {
            table.debug && console.log(`Geospatial data. Using loadGeoData`)
            await table.loadGeoData(`${cachePath}/${id}.geojson`)
        } else {
            table.debug && console.log(`Tabular data. Using loadData`)
            await table.loadData(`${cachePath}/${id}.parquet`)
        }
    }
}

async function runAndWrite(
    table: SimpleTable,
    run: () => Promise<void>,
    cacheSources: cacheSources,
    cacheSourcesPath: string,
    cachePath: string,
    id: string
) {
    await run()
    table.debug && console.log("\ncache() after run()")
    const types = await table.getTypes()
    const hasGeometries = Object.values(types).some((d) => d === "GEOMETRY")
    if (hasGeometries) {
        table.debug &&
            console.log(`\nThe table has geometries. Using writeGeoData.`)
        await table.writeGeoData(`${cachePath}/${id}.geojson`)
        cacheSources[id] = {
            timestamp: Date.now(),
            geo: true,
        }
    } else {
        table.debug &&
            console.log(`\nNo geometries in the table. Using writeData.`)
        await table.writeData(`${cachePath}/${id}.parquet`)
        cacheSources[id] = {
            timestamp: Date.now(),
            geo: false,
        }
    }
    writeFileSync(cacheSourcesPath, JSON.stringify(cacheSources))
}
