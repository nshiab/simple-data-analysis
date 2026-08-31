import { assertEquals, assertRejects } from "@std/assert";
import { calls, loaded } from "./state.ts";
import { SimpleDB } from "../../../src/index.ts";

assertEquals(loaded, [], "Importing SDA must not evaluate integrations");
const sdb = new SimpleDB();
try {
  const table = sdb.newTable("data");
  switch (Deno.args[0]) {
    case "core": {
      const result = await table.loadArray([{ value: 1 }, { value: 2 }])
        .filter("value > 1").getData();
      assertEquals(result, [{ value: 2 }]);
      assertEquals(loaded, []);
      break;
    }
    case "queued": {
      const options = { skip: 0 };
      assertEquals(table.loadSheet("fixture", options), table);
      options.skip = 1;
      table.filter("value > 1");
      assertEquals(loaded, [], "Queueing a method must not load integrations");
      assertEquals(await table.getData(), [{ value: 2 }]);
      assertEquals(loaded, ["google"]);
      assertEquals(calls, [{ method: "getSheetData", value: 0 }]);
      await table.loadSheet("fixture", { skip: 1 }).run();
      assertEquals(loaded, ["google"], "Repeated calls reuse the module");
      break;
    }
    case "ai": {
      await table.loadArray([{ value: 1 }]).run();
      const result = table.aiQuery("Return 42", {
        outputTable: "answer",
        generation: { provider: "gemini", model: "fixture", cache: false },
      });
      assertEquals(result.name, "answer");
      assertEquals(loaded, []);
      assertEquals(await result.filter("answer > 0").getData(), [{
        answer: 42,
      }]);
      assertEquals(loaded.includes("ai"), true);
      assertEquals(loaded.includes("google"), false);
      assertEquals(loaded.includes("dataviz"), false);
      break;
    }
    case "observers": {
      let value = 1;
      let requests = 0;
      table.getData = () => {
        requests++;
        return Promise.resolve([{ value }]);
      };
      const first = table.writeChart(
        () => ({} as HTMLElement),
        `${Deno.args[1]}/first.png`,
      );
      assertEquals(
        requests,
        1,
        "writeChart must request data before awaiting its import",
      );
      value = 2;
      const second = table.writeChart(
        () => ({} as HTMLElement),
        `${Deno.args[1]}/second.png`,
      );
      assertEquals(requests, 2);
      await Promise.all([first, second]);
      assertEquals(loaded, ["dataviz"]);
      assertEquals(calls, [
        { method: "saveChart", value: [{ value: 1 }] },
        { method: "saveChart", value: [{ value: 2 }] },
      ]);
      const sheet = table.toSheet("fixture");
      assertEquals(
        requests,
        3,
        "toSheet must request data before awaiting its import",
      );
      await sheet;
      assertEquals(loaded, ["dataviz", "google"]);
      assertEquals(calls.at(-1), {
        method: "pushToSheet",
        value: [{ value: 2 }],
      });
      break;
    }
    case "failure": {
      table.loadSheet("fixture");
      assertEquals(loaded, []);
      await assertRejects(
        () => table.run(),
        Error,
        "Google module could not load",
      );
      break;
    }
    default:
      throw new Error(`Unknown scenario ${Deno.args[0]}`);
  }
} finally {
  await sdb.close();
}
