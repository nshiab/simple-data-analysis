import { assert, assertEquals } from "@std/assert";

export default async function assertArtifact(path: string): Promise<void> {
  const contents = await Deno.readFile(path);
  assert(contents.byteLength > 8, `Expected ${path} to be non-empty`);
  if (path.endsWith(".png")) {
    assertEquals(Array.from(contents.slice(0, 8)), [
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
    ]);
  } else {
    assert(new TextDecoder().decode(contents).includes("<svg"));
  }
}
