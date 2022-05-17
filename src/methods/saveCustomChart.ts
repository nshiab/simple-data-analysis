import { Options, SimpleDataItem } from "../types/SimpleData.types.js"
import getExtension from "../helpers/getExtension.js"
import getPlotHtmlAndWrite from "../helpers/getPlotHtmlAndWrite.js"
import log from "../helpers/log.js"


export default function saveCustomChart(data: SimpleDataItem[], path: string, plotOptions: any, options: Options): SimpleDataItem[] {

    const extension = getExtension(path)
    if (extension !== "html") {
        throw new Error("For the moment, you can only export charts with file extension .html")
    }

    getPlotHtmlAndWrite(plotOptions, path, options)

    return data
}