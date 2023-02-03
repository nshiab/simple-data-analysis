import { FeatureCollection } from "@turf/turf"
import log from "../helpers/log.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import SimpleData from "./SimpleData.js"
import { Topology } from "topojson-specification"
import { feature } from "topojson-client"

export default class SimpleDataGeo extends SimpleData {
    // If modified, might need to be modified in SimpleData too
    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
    }

    constructor({
        data = [],
        dataAsArrays = false,
        geoData = null,
        topoData = null,
        topoKey = null,
        verbose = false,
        noTests = false,
        logParameters = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
        noLogs = false,
        firstItem = 0,
        lastItem = Infinity,
        duration = 0,
    }: {
        data?: SimpleDataItem[] | { [key: string]: SimpleDataValue[] }
        geoData?: null | FeatureCollection
        topoData?: null | Topology
        topoKey?: null | string
        dataAsArrays?: boolean
        verbose?: boolean
        noTests?: boolean
        logParameters?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
        noLogs?: boolean
        firstItem?: number
        lastItem?: number
        duration?: 0
    } = {}) {
        super({
            data,
            dataAsArrays,
            verbose,
            noTests,
            logParameters,
            nbTableItemsToLog,
            fillMissingKeys,
            noLogs,
            firstItem,
            lastItem,
            duration,
        })

        const incomingData = []

        if (geoData !== null && topoData !== null) {
            throw new Error(
                "You can't have geoData and topoData. Use only one."
            )
        }

        if (geoData) {
            !noLogs && verbose && log("Incoming geoData")

            for (const feature of geoData.features.slice(
                firstItem,
                lastItem + 1
            )) {
                incomingData.push({
                    geometry: feature.geometry,
                    ...feature.properties,
                })
            }

            this._data = incomingData
        } else if (topoData) {
            if (topoKey === null) {
                throw new Error("Need a topoKey for topoData.objects[topoKey]")
            }

            const convertedTopo = feature(
                topoData,
                topoData.objects[topoKey]
            ) as unknown as FeatureCollection

            for (const feature of convertedTopo.features.slice(
                firstItem,
                lastItem + 1
            )) {
                incomingData.push({
                    geometry: feature.geometry,
                    ...feature.properties,
                })
            }

            this._data = incomingData
        }
    }
}
