import { round } from "../exports/helpers.js"

export default function toPercentage(
    value: number,
    totalValue: number,
    numDigits = 2
): string {
    return `${round((value / totalValue) * 100, numDigits)}%`
}
