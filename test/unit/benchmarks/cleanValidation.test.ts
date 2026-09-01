import { assertRejects } from "@std/assert";
import assertEquivalentCleanOutputs from "../../../benchmarks/cleanValidation.ts";

Deno.test("cleaned benchmark outputs compare canonical values", async () => {
  const directory = await Deno.makeTempDir();
  const expected = `${directory}/expected.csv`;
  const equivalent = `${directory}/equivalent.csv`;
  try {
    await Deno.writeTextFile(
      expected,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,12.0,2020\n",
    );
    await Deno.writeTextFile(
      equivalent,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,12,2020\n",
    );
    await assertEquivalentCleanOutputs(expected, equivalent, "tidyverse");
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("cleaned benchmark outputs reject schema and value differences", async () => {
  const directory = await Deno.makeTempDir();
  const expected = `${directory}/expected.csv`;
  const different = `${directory}/different.csv`;
  try {
    await Deno.writeTextFile(
      expected,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,12,2020\n",
    );
    await Deno.writeTextFile(
      different,
      "time,station,station_name,tas,decade\n2020-01-01,1,Station,13,2020\n",
    );
    await assertRejects(
      () => assertEquivalentCleanOutputs(expected, different, "pandas"),
      Error,
      "1 row mismatches",
    );
    await Deno.writeTextFile(
      different,
      "time,station,station_name,tas\n2020-01-01,1,Station,12\n",
    );
    await assertRejects(
      () => assertEquivalentCleanOutputs(expected, different, "pandas"),
      Error,
      "cleaned output columns must be",
    );
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
