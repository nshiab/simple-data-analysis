import { Options } from "../types/SimpleData.types.js";

export default function isMissingValue(value: any, options: Options): boolean {
    return options.missingValuesArray.includes(value)
}