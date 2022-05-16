import { defaultOptions, Options } from "../types.js"

export default function getParametersAndOptions(simpleDataOptions: Options, ...args: any[]) {

    const parameters = args
    let options

    if (
        args.length > 0 &&
        typeof args[args.length - 1] === "object" &&
        Object.keys(defaultOptions).includes(Object.keys(args[args.length - 1])[0])
    ) {
        options = { ...simpleDataOptions, ...args[args.length - 1] }
        parameters[args.length - 1] = options
    } else {
        options = simpleDataOptions
        parameters.push(options)
    }

    return { parameters, options }

}