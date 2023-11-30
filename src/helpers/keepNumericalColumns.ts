export default function keepNumericalColumns(types: { [key: string]: string }) {
    const columns: string[] = []
    for (const col of Object.keys(types)) {
        if (
            ["FLOAT", "DOUBLE", "DECIMAL"].includes(types[col]) ||
            types[col].includes("INT")
        ) {
            columns.push(col)
        }
    }
    return columns
}
