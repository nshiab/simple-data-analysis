import { Options } from "../types";

export default function isMissingValue(value: any, options: Options): boolean {
    return options.missingValuesArray.includes(value)
}