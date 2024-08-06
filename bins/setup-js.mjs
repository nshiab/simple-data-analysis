#!/usr/bin/env node

import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "fs"

console.log("Starting JS setup with NodeJS for sda...")

if (existsSync(`package.json`)) {
    console.log("There is already a package.json here. Not doing the setup.")
    process.exit(1)
} else {
    console.log("Installing libraries...")
    execSync("npm i simple-data-analysis journalism --silent", {
        stdio: "ignore",
    })

    console.log("Updating package.json...")
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"))
    packageJson.type = "module"
    packageJson.scripts = {
        sda: "node --watch index.js",
    }
    writeFileSync("package.json", JSON.stringify(packageJson, null, 2))

    console.log("Adding .gitignore file...")
    writeFileSync(".gitignore", "node_modules")

    console.log("Adding index.js file...")
    const indexContent = `import { SimpleDB } from "simple-data-analysis";
import { prettyDuration } from "journalism";

const start = new Date();

const sdb = new SimpleDB();

const table = await sdb
  .newTable("fireCanada2023")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv"
  );

await table.logTable();

prettyDuration(start, { log: true, prefix: "\\nDone in " });
`

    writeFileSync("index.js", indexContent)

    console.log("Setup is done!")
    console.log("Use 'npm run sda' to run and watch index.js.")
    console.log("Have fun. ^_^")
}
