import { SimpleDataItem } from "../../types/SimpleData.types.js"
import writeFileWithStream from "../../helpers/writeFileWithStream.js"

export default async function saveDataWithStream(
    data: SimpleDataItem[],
    path: string,
    encoding: BufferEncoding,
    verbose: boolean
) {
    await writeFileWithStream(data, path, encoding, verbose)

    return data
}
