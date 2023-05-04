import { FeatureCollection } from "@turf/turf"
import log from "../helpers/log.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import SimpleData from "./SimpleData.js"
import { Topology } from "topojson-specification"
import { feature } from "topojson-client"
import { geoDataToArrayOfObjects } from "../indexWeb.js"

export default class SimpleDataGeo extends SimpleData {
    constructor({
        data = [],
        dataAsArrays = false,
        geoData = null,
        topoData = null,
        verbose = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
        firstItem = 0,
        lastItem = Infinity,
        duration = 0,
    }: {
        data?: SimpleDataItem[] | { [key: string]: SimpleDataValue[] }
        dataAsArrays?: boolean
        geoData?: null | FeatureCollection
        topoData?: null | Topology
        verbose?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
        firstItem?: number
        lastItem?: number
        duration?: 0
    } = {}) {
        super({
            data,
            dataAsArrays,
            verbose,
            nbTableItemsToLog,
            fillMissingKeys,
            firstItem,
            lastItem,
            duration,
        })

        if (geoData !== null && topoData !== null) {
            throw new Error(
                "You can't have geoData and topoData. Use only one."
            )
        }

        if (geoData) {
            verbose && log("Incoming geoData")

            this._data = geoDataToArrayOfObjects(geoData, firstItem, lastItem)
        } else if (topoData) {
            verbose && log("Incoming geoData")

            const convertedTopoData = feature(
                topoData,
                Object.keys(topoData.objects)[0]
            ) as unknown as FeatureCollection

            this._data = geoDataToArrayOfObjects(
                convertedTopoData,
                firstItem,
                lastItem
            )
        }
    }
}
