export default function crossJoinQuery(
    table: string,
    rightTable: string,
    options: {
        outputTable?: string
    } = {}
) {
    return `CREATE OR REPLACE TABLE ${options.outputTable ?? table} AS SELECT ${table}.*, ${rightTable}.* FROM ${table} CROSS JOIN ${rightTable};`
}
