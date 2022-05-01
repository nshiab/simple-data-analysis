import { Options, ArrayOfObjects } from "../types"

const defaultOptions: Options = {
    logs: false
}

export default function describe(data: ArrayOfObjects, opts: Options): number {

    const options: Options = {
        ...defaultOptions,
        ...opts
    }

    options.logs && console.log(data.length)

    return data.length
}