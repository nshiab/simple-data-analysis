import round from "./round.js"

export default function percentage(
    value: number,
    totalValue: number,
    numDigits = 2
): string {
    return `${round((value / totalValue) * 100, numDigits)}%`
}
