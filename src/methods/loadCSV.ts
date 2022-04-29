interface Options {
    logs: boolean
}

export default function loadCSV(path: string, options: Options = { logs: false }) {

    if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {

        options.logs && console.log('this script is running in Node.js')

    } else {

        options.logs && console.log('this script is running in the browser')

    }

    return path
}