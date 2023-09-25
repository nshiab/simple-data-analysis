import { Connection } from "duckdb"

export default async function queryNode(
    query: string,
    connection: Connection,
    returnDataFromQuery: boolean
) {
    return new Promise((resolve) => {
        if (returnDataFromQuery) {
            connection.all(query, (err, res) => {
                if (err) {
                    throw err
                }
                resolve(res)
            })
        } else {
            connection.exec(query, (err) => {
                if (err) {
                    throw err
                }
                resolve("No error")
            })
        }
    })
}
