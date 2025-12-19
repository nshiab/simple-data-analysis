import { existsSync, mkdirSync } from "node:fs";

export default function createDirectory(path: string): void {
  path = path
    .split("/")
    .filter((d) => (d.startsWith(".") ? true : !d.includes(".")))
    .join("/");

  if (path !== "" && !existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}
