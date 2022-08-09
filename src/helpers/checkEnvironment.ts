export default function checkEnvironment() {
    if (
        typeof process !== "undefined" &&
        typeof process.release !== "undefined" &&
        typeof process.release.name !== "undefined" &&
        process.release.name.search(/node|io.js/) !== -1
    ) {
        return "nodejs"
    } else {
        return "webBrowser"
    }
}
