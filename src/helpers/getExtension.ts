export default function getExtension(path: string) {
    const extensionSplit = path
        .replace(".gz", "")
        .replace(".zstd", "")
        .split(".")
    const extension =
        extensionSplit[extensionSplit.length - 1].toLocaleLowerCase()

    return extension
}
