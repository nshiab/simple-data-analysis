export function checkEnvironment() {
    if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {
        return "nodejs"
    } else {
        return "webBrowser"
    }
}