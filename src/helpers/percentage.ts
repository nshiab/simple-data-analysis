export default function percentage(value: number, totalValue: number, numDigits?: number): string {
    const digits = numDigits === undefined ? 2 : numDigits
    return `${(value / totalValue * 100).toFixed(digits)}%`
}