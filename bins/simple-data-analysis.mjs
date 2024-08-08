#!/usr/bin/env node

import { execSync } from "node:child_process"
import { existsSync, writeFileSync } from "fs"

console.log("\nStarting sda setup for NodeJS...")

const indexContent = `import { SimpleDB } from "simple-data-analysis";
import { prettyDuration } from "journalism";

const start = Date.now();

const sdb = new SimpleDB();

const table = await sdb
  .newTable()
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv"
  );

await table.logTable();

prettyDuration(start, { log: true, prefix: "\\nDone in " });
`
const tsconfigContent = `{
  "compilerOptions": {
    "module": "NodeNext",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "verbatimModuleSyntax": null
  },
  "include": ["**/*"],
  "exclude": ["node_modules"]
}
`

const args = process.argv.slice(2)

const runtime = args.includes("--bun") ? "bun" : "nodejs"
let language = args.includes("--js") ? "js" : "ts"
const force = args.includes("--force")

if (existsSync("package.json") && force === false) {
    console.log(
        "\n/!\\ There is already a package.json here. Not doing the setup."
    )
    console.log(
        "/!\\ Start over in a new folder or pass the option --force to overwrite files."
    )
    console.log("/!\\ Bye bye!\n")
    process.exit(1)
} else {
    console.log("\n1 - Checking options...")

    if (runtime === "bun") {
        console.log("    => Setting things up for Bun.")
        if (language === "js") {
            console.log("    => Setting things up for JavaScript.")
        } else {
            console.log("    => Setting things up for TypeScript.")
        }
    } else {
        console.log("    => Setting things up for Node.js.")
        if (language === "ts") {
            const nodeVersion = process.version
                .split(".")
                .map((d) => parseInt(d.replace("v", "")))
            if (nodeVersion[0] >= 22 && nodeVersion[1] >= 6) {
                console.log(
                    "    => Node.js version is >= 22.6.0. Setting things up for TypeScript."
                )
            } else {
                console.log(
                    "    => Node.js version is < 22.6.0. Setting things up for JavaScript."
                )
                language = "js"
            }
        } else {
            console.log("    => Setting things up for JavaScript.")
        }
    }
    if (force) {
        console.log("    => Option force is true. Files will be overwritten.")
    }

    console.log("\n2 - Creating relevant files...")
    const packageJson = {
        type: "module",
    }
    if (runtime === "bun") {
        if (language === "ts") {
            packageJson.scripts = {
                sda: "bun --watch index.ts",
            }
        } else {
            packageJson.scripts = {
                sda: "bun --watch index.js",
            }
        }
    } else {
        if (language === "ts") {
            packageJson.scripts = {
                sda: "node --experimental-strip-types --no-warnings --watch index.ts",
            }
        } else {
            packageJson.scripts = {
                sda: "node --no-warnings --watch index.js",
            }
        }
    }
    packageJson.scripts.clean = "rm -rf .sda-cache && rm -rf .temp"
    writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
    console.log("    => package.json has been created.")

    if (runtime === "nodejs" && language === "ts") {
        writeFileSync("tsconfig.json", tsconfigContent)
        console.log("    => tsconfig.json has been created.")
    }

    writeFileSync(".gitignore", "node_modules\n.temp\n.sda-cache")
    console.log("    => .gitignore has been created.")

    if (language === "ts") {
        writeFileSync("index.ts", indexContent)
        console.log("    => index.ts has been created.")
    } else {
        writeFileSync("index.js", indexContent)
        console.log("    => index.js has been created.")
    }

    console.log("\n3 - Installing libraries with npm...")
    execSync("npm i simple-data-analysis --silent", {
        stdio: "ignore",
    })
    console.log("    => simple-data-analysis has been installed.")
    execSync("npm i journalism --silent", {
        stdio: "ignore",
    })
    console.log("    => journalism has been installed.")

    console.log("\nSetup is done!")
    if (language === "ts") {
        console.log("    => Run 'npm run sda' to watch index.ts.")
    } else {
        console.log("    => Run 'npm run sda' to watch index.js.")
    }

    console.log("    => Have fun. ^_^\n")
}
