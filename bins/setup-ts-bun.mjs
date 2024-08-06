#!/usr/bin/env bun

import { $, file, write } from "bun"

console.log("Starting TS setup with Bun for sda...")

const packageJsonFile = file("package.json")

if (await packageJsonFile.exists()) {
    console.log("There is already a package.json here. Not doing the setup.")
    process.exit(1)
} else {
    console.log("Installing libraries...")
    await $`bun install simple-data-analysis journalism --silent`

    console.log("Updating package.json...")
    const packageJsonFile = file("package.json")
    const packageJson = await packageJsonFile.json()
    packageJson.type = "module"
    packageJson.scripts = {
        sda: "bun --watch index.ts",
    }
    await write("package.json", JSON.stringify(packageJson, null, 2))

    console.log("Adding .gitignore file...")
    await write(".gitignore", "node_modules")

    console.log("Adding index.ts file...")
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

    await write("index.ts", indexContent)

    console.log("Setup is done!")
    console.log("Use 'bun run sda' to run and watch index.js.")
    console.log("Have fun. ^_^")
}
