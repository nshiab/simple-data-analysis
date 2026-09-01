import { SimpleDB } from "../../src/index.ts";
import { requiredEnvironment } from "../environment.ts";
import {
  observeSdaQueries,
  queryProfileEnvironment,
  writeQueryProfile,
} from "../queryProfile.ts";
import runSpatialSdaPipeline from "./sdaPipeline.ts";

const treesInput = requiredEnvironment("BENCHMARK_INPUT");
const neighbourhoodsInput = requiredEnvironment("BENCHMARK_POLYGONS");
const resultOutput = requiredEnvironment("BENCHMARK_RESULT_OUTPUT");
const profileOutput = Deno.env.get(queryProfileEnvironment);
const profileStart = profileOutput === undefined ? 0 : performance.now();
const sdb = new SimpleDB();
const observer = profileOutput === undefined ? null : observeSdaQueries(sdb);

try {
  await runSpatialSdaPipeline(sdb, {
    treesInput,
    neighbourhoodsInput,
    resultOutput,
  });
} finally {
  await sdb.close();
  if (profileOutput !== undefined && observer !== null) {
    await writeQueryProfile(profileOutput, {
      totalMilliseconds: performance.now() - profileStart,
      queries: observer.queries,
    });
  }
}
