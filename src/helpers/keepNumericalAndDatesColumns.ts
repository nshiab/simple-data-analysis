export default function keepNumericalAndDatesColumns(types: {
    [key: string]: string
}) {
    const columns: string[] = []
    for (const col of Object.keys(types)) {
        if (
            [
                "FLOAT",
                "DOUBLE",
                "DECIMAL",
                "DATE",
                "TIME",
                "TIMESTAMP",
                "TIMESTAMP WITH TIME ZONE",
            ].includes(types[col]) ||
            types[col].includes("INT")
        ) {
            columns.push(col)
        }
    }
    if (columns.length === 0) {
        throw new Error("No numerical or date columns")
    }
    return columns
}
