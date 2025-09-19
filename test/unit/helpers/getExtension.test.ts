import { assertEquals } from "@std/assert";
import getExtension from "../../../src/helpers/getExtension.ts";

Deno.test("should return the extension when csv", function () {
  const extension = getExtension("coucou/key2/pat.a.te.csv");
  assertEquals(extension, "csv");
});
Deno.test("should return the extension when csv is compressed", function () {
  const extension = getExtension("coucou/key2/pat.a.te.csv.gz");
  assertEquals(extension, "csv");
});
Deno.test("should return the extension when json", function () {
  const extension = getExtension("coucou/key2/pat.a.te.json");
  assertEquals(extension, "json");
});
Deno.test("should return the extension when json is compressed", function () {
  const extension = getExtension("coucou/key2/pat.a.te.json.gz");
  assertEquals(extension, "json");
});
Deno.test("should return the extension when parquet", function () {
  const extension = getExtension("coucou/key2/pat.a.te.parquet");
  assertEquals(extension, "parquet");
});
