import { loadCSV } from "../dist/index.js"

const simpleData = await loadCSV("./examples/data/employees.csv")

simpleData.renameKey("Hire date", "HireDate", { logs: true }).describe({ logs: true })