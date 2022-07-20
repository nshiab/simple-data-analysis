export default function isValidNumber(value: string): boolean {
    const numberRegex = /^\s*[+-]?(\d+|\d*\.\d+|\d+\.\d*)([Ee][+-]?\d+)?\s*$/
    return numberRegex.test(value)
}
