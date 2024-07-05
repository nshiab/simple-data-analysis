import { readFileSync, writeFileSync, unlinkSync } from "fs"
import SimpleDB from "../class/SimpleDB"

export default function cleanCache(sdb: SimpleDB) {
    if (sdb.cacheSourcesUsed.length > 0) {
        const cacheSources = JSON.parse(
            readFileSync(".sda-cache/sources.json", "utf-8")
        )
        let first = true
        for (const cacheId of Object.keys(cacheSources)) {
            if (!sdb.cacheSourcesUsed.includes(cacheId)) {
                if (first) {
                    console.log("")
                    first = false
                }
                sdb.cacheVerbose &&
                    console.log(
                        `Removing unused file from cache: ${cacheSources[cacheId].file}`
                    )
                unlinkSync(cacheSources[cacheId].file)
                delete cacheSources[cacheId]
            }
        }
        console.log("")
        writeFileSync(".sda-cache/sources.json", JSON.stringify(cacheSources))
    }
}
