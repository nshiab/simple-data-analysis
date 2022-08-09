import checkEnvironment from "./checkEnvironment.js"

export default function log(
    valuesToLog: object | string | number,
    color?: "bgRed" | "blue"
) {
    // TODO: colors for web browser

    console.log("log function")
    console.log("valuesToLog", valuesToLog)

    const environment = checkEnvironment()

    console.log(environment)

    if (environment === "nodejs") {
        if (color === "bgRed") {
            console.log("\x1b[41m", valuesToLog, "\x1b[0m")
        } else if (color === "blue") {
            console.log("\x1b[34m", valuesToLog, "\x1b[0m")
        } else {
            console.log(valuesToLog)
        }
    } else {
        console.log(valuesToLog)
    }
}
