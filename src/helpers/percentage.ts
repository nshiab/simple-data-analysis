import { Options } from "../types.js";

export default function percentage(value: number, totalValue: number, options: Options): string {
    return `${(value / totalValue * 100).toFixed(options.fractionDigits)}%`
}