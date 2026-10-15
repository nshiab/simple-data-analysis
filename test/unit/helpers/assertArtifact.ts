import { expect } from "vite-plus/test";
import { readFile } from "node:fs/promises";
import { assert } from "../../helpers/assertions.ts";

export default async function assertArtifact(path: string): Promise<void> {
  const contents = await readFile(path);
  assert(contents.byteLength > 8, `Expected ${path} to be non-empty`);
  if (path.endsWith(".png")) {
    expect(Array.from(contents.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  } else {
    assert(new TextDecoder().decode(contents).includes("<svg"));
  }
}
