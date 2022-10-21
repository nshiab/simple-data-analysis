import { format } from "d3-format"

export default function round(value: number, nbDigits: number) {
    const f = format(`.${nbDigits}f`)

    return parseFloat(f(value))
}
