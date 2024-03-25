export default function logData(
    data:
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | null
) {
    if (data === null) {
        console.log("Data is null")
    } else {
        if (data.length === 0) {
            console.table(data)
        } else {
            const dataToBeLogged: {
                [key: string]: string | number | boolean | Date | null
            }[] = []
            const keys = Object.keys(data[0])
            for (let i = 0; i < data.length; i++) {
                const newItem: {
                    [key: string]: string | number | boolean | Date | null
                } = {}
                for (const key of keys) {
                    if (Buffer && Buffer.isBuffer(data[i][key])) {
                        newItem[key] = "<Buffer>"
                    } else {
                        newItem[key] = data[i][key]
                    }
                }
                dataToBeLogged.push(newItem)
            }
            console.table(dataToBeLogged)
        }
    }
}
