import { loadCSV } from "../dist/index.js"

const simpleData = await loadCSV("./examples/data/employees.csv", { logs: true })

simpleData.describe({ logs: true })