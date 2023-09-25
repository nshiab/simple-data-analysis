import { Connection } from "duckdb"

export default async function queryNode(
    query: string,
    connection: Connection,
    returnData: boolean
) {
    return new Promise((resolve) => {
        if (returnData) {
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
                resolve(true)
            })
        }
    })
}
