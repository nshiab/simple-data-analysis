import { test } from "vite-plus/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { assertRejects } from "../../helpers/assertions.ts";
import assertEquivalentCleanOutputs from "../../../benchmarks/cleanValidation.ts";

test("cleaned benchmark outputs compare canonical values", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const expected = `${directory}/expected.csv`;
  const equivalent = `${directory}/equivalent.csv`;
  try {
    await writeFile(
      expected,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,12.0,2020\n",
    );
    await writeFile(
      equivalent,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,12,2020\n",
    );
    await assertEquivalentCleanOutputs(expected, equivalent, "tidyverse");
  } finally {
    await rm(directory, { recursive: true });
  }
});

test("cleaned benchmark outputs reject schema and value differences", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const expected = `${directory}/expected.csv`;
  const different = `${directory}/different.csv`;
  try {
    await writeFile(
      expected,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,12,2020\n",
    );
    await writeFile(
      different,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,13,2020\n",
    );
    await assertRejects(
      () => assertEquivalentCleanOutputs(expected, different, "pandas"),
      Error,
      "1 row mismatches",
    );
    await writeFile(different, "time,station,station_name,tas\n2020-01-01,1,Station,12\n");
    await assertRejects(
      () => assertEquivalentCleanOutputs(expected, different, "pandas"),
      Error,
      "cleaned output columns must be",
    );
  } finally {
    await rm(directory, { recursive: true });
  }
});
