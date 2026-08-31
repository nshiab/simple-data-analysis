import { SimpleDB } from "../../src/index.ts";
import { requiredEnvironment } from "../environment.ts";
import {
  observeSdaQueries,
  queryProfileEnvironment,
  writeQueryProfile,
} from "../queryProfile.ts";
import runTabularSdaPipeline from "./sdaPipeline.ts";

const input = requiredEnvironment("BENCHMARK_INPUT");
const cleanOutput = requiredEnvironment("BENCHMARK_CLEAN_OUTPUT");
const resultOutput = requiredEnvironment("BENCHMARK_RESULT_OUTPUT");
const profileOutput = Deno.env.get(queryProfileEnvironment);
const profileStart = profileOutput === undefined ? 0 : performance.now();
const sdb = new SimpleDB();
const observer = profileOutput === undefined ? null : observeSdaQueries(sdb);

try {
  await runTabularSdaPipeline(sdb, { input, cleanOutput, resultOutput });
} finally {
  await sdb.close();
  if (profileOutput !== undefined && observer !== null) {
    await writeQueryProfile(profileOutput, {
      totalMilliseconds: performance.now() - profileStart,
      queries: observer.queries,
    });
  }
}
