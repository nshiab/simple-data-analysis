#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";

console.log("\nStarting sda setup for NodeJS...");

const args = process.argv.slice(2);

const runtime = args.includes("--bun") ? "bun" : "nodejs";
let language = args.includes("--js") ? "js" : "ts";
const force = args.includes("--force");

if (existsSync("package.json") && force === false) {
  console.log(
    "\n/!\\ There is already a package.json here. Not doing the setup."
  );
  console.log(
    "/!\\ Start over in a new folder or pass the option --force to overwrite files."
  );
  console.log("/!\\ Bye bye!\n");
  process.exit(1);
} else {
  console.log("\n1 - Checking options...");

  if (runtime === "bun") {
    console.log("    => Setting things up for Bun.");
    if (language === "js") {
      console.log("    => Setting things up for JavaScript.");
    } else {
      console.log("    => Setting things up for TypeScript.");
    }
  } else {
    console.log("    => Setting things up for Node.js.");
    if (language === "ts") {
      const nodeVersion = process.version
        .split(".")
        .map((d) => parseInt(d.replace("v", "")));
      if (nodeVersion[0] >= 22 && nodeVersion[1] >= 6) {
        console.log(
          "    => Node.js version is >= 22.6.0. Setting things up for TypeScript."
        );
      } else {
        console.log(
          "    => Node.js version is < 22.6.0. Setting things up for JavaScript."
        );
        language = "js";
      }
    } else {
      console.log("    => Setting things up for JavaScript.");
    }
  }
  if (force) {
    console.log("    => Option force is true. Files will be overwritten.");
  }

  console.log("\n2 - Installing libraries with npm...");
  execSync("npm i simple-data-analysis --silent", {
    stdio: "ignore",
  });
  console.log("    => simple-data-analysis has been installed.");
  execSync("npm i journalism --silent", {
    stdio: "ignore",
  });
  console.log("    => journalism has been installed.");

  console.log("\n3 - Creating and updating relevant files...");
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  packageJson.type = "module";
  if (runtime === "bun") {
    if (language === "ts") {
      packageJson.scripts = {
        sda: "bun --watch index.ts",
      };
    } else {
      packageJson.scripts = {
        sda: "bun --watch index.js",
      };
    }
  } else {
    if (language === "ts") {
      packageJson.scripts = {
        sda: "node --experimental-strip-types --no-warnings --watch index.ts",
      };
    } else {
      packageJson.scripts = {
        sda: "node --no-warnings --watch index.js",
      };
    }
  }
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("    => package.json has been updated.");

  if (runtime === "nodejs" && language === "ts") {
    const indexContent = readFileSync("tsconfig-content.json", "utf-8");
    writeFileSync("tsconfig.json", indexContent);
    console.log("    => tsconfig.json has been created.");
  }

  writeFileSync(".gitignore", "node_modules\n.temp\n.sda-cache");
  console.log("    => .gitignore has been created.");

  const indexContent = readFileSync("index-content.js", "utf-8");
  if (language === "ts") {
    writeFileSync("index.ts", indexContent);
    console.log("    => index.ts has been created.");
  } else {
    writeFileSync("index.js", indexContent);
    console.log("    => index.js has been created.");
  }

  console.log("\nSetup is done!");
  if (language === "ts") {
    console.log("    => Run npm run sda to watch index.ts.");
  } else {
    console.log("    => Run npm run sda to watch index.js.");
  }

  console.log("    => Have fun. ^_^\n");
}
