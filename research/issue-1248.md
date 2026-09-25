# Issue 1248 implementation and validation

Completed September 25, 2026 in the `explore-issue-1248` SDA worktree, based on
`26c558f962e4e526669bbcf49348b48b15f8030e`. The PR branch was subsequently
rebased onto `8231fab1` (SDA 6.0.8, Core 2.1.2) and fully validated again.

## Upstream release

Journalism AI **2.0.7** adds the optional `getEmbedding.beforeRequest` hook. It
is awaited after cache lookup and immediately before Ollama, Gemini API, or
Vertex dispatch. Cache hits skip it; rejection prevents provider dispatch and
successful caching. The callback does not affect embedding identity or cache
keys.

Twelve fake-provider hook tests passed across all three backends. The
`deno task patch` completed its full checks (38 tests), committed and pushed
`03bae7b3d5852453e16c724fb4d241f291b89c14`, and tagged v2.0.7. Both
[JSR](https://github.com/nshiab/journalism-ai/actions/runs/36156188570) and
[npm](https://github.com/nshiab/journalism-ai/actions/runs/36156188665)
publication workflows succeeded.
[Release](https://github.com/nshiab/journalism-ai/releases/tag/v2.0.7).

SDA now pins the released package, updated using:

```sh
deno outdated --update --latest --min-dep-age=0 @nshiab/journalism-ai
```

## SDA changes

- [aiEmbeddings](../src/methods/aiEmbeddings.ts) uses SDA's existing
  [request pool](../src/helpers/runAIRequestPool.ts), just like `aiRowByRow`.
  Free slots refill within each Core transfer batch; indexed results preserve
  source/output matching when requests finish out of order.
- One pacing state spans the entire enrichment operation. The provider hook
  applies pacing only to cache misses, replacing the elapsed-time cache guess
  and wave delays. Embeddings still make one provider request per input string.
- Core transfers remain sequential, now with a fixed 1,000-row size independent
  of concurrency. Only the input column is read into JavaScript and only the
  generated column is returned for staging.
- Embeddings do not retry automatically. On a terminal failure, new tasks stop,
  rate-limit waits are cancelled before dispatch, and active work settles before
  the original error propagates. The pool also drains if `retryCheck` throws.
  Row generation retains its existing retries and error-column behavior.
- Shared scheduling validation now runs before reading rows or changing
  embedding provenance/indexes. The old mutation-oriented `tryEmbedding` helper
  is replaced by
  [getEmbeddingForProvider](../src/helpers/getEmbeddingForProvider.ts),
  including its vector-search caller. Hybrid-search regeneration validates
  concurrency too.
- Public method signatures are unchanged. Existing embedding progress
  formatting, provenance/index behavior, SQL-value preservation, and
  late-failure behavior remain covered. Empty input retains its existing error
  when no output column exists; it never dispatches provider work.

## Validation

`deno task all-tests` passed: **190 tests**, formatting, lint, source type
checking, JSDoc lint, publication dry run, Node ESM/CommonJS and Bun
ESM/CommonJS smoke tests, package-content checks, and generated documentation.
The benchmark was also separately linted and type-checked. No live-provider
coverage is claimed.

New tests cover controlled slot refill and bounded concurrency, out-of-order
matching, retry pacing across pool invocations, cached-result bypass, pacing
across real Core transfer boundaries, early validation without metadata/index
changes, settling active failures, cancelling pacing waits, staging cleanup,
empty input, and null-only early output batches. Existing tests continue
covering untouched BIGINT, DATE, DECIMAL, nested, geometry, and independent
vector columns.

The original exploration probes were replaced by regression tests in
[test/unit/helpers/runAIRequestPool.test.ts](../test/unit/helpers/runAIRequestPool.test.ts),
[test/unit/methods/aiEmbeddings.test.ts](../test/unit/methods/aiEmbeddings.test.ts),
and
[test/unit/methods/aiRowByRow.test.ts](../test/unit/methods/aiRowByRow.test.ts).

## Provider-free memory experiment

[Harness](../benchmarks/aiEmbeddingsMemory.ts),
[raw measurements](./issue-1248-memory.json). Deno 2.9.6, macOS arm64, Core
2.1.1 at measurement time; each row count ran in a separate process. Concurrency
4, Core transfer size 1,000, input width 512 bytes, vector dimensions 128, and
response caching disabled. Input rows were created in SQL; the harness never
reads the complete result into JavaScript. Peak observed active requests was 4
in every run.

| Total rows | Sampled post-GC JS heap (MiB) | Heap increase over baseline (MiB) | Sampled RSS (MiB) | DuckDB allocation after completion (MiB) |
| ---------: | ----------------------------: | --------------------------------: | ----------------: | ---------------------------------------: |
|      1,000 |                         18.98 |                              2.10 |            147.39 |                                     2.21 |
|     10,000 |                         20.30 |                              3.30 |            191.22 |                                    11.46 |
|     50,000 |                         20.21 |                              3.32 |            382.78 |                                    52.46 |

The sampled JavaScript heap plateaus between 10,000 and 50,000 rows, consistent
with retaining one bounded batch of inputs/tasks/results. This is a sampled
retention experiment, not an exact allocation count or proof of a strict heap
cap. RSS includes JavaScript, native allocations, and other process memory.
DuckDB allocation is queried only while idle; the reported value is not its
peak. Core snapshots and stages data inside DuckDB, so native/process memory is
expected to grow with the dataset. Recorded elapsed times include DuckDB work
and forced GC and must not be described as a pure scheduler speed comparison.

Reproduce each measurement in a fresh process:

```sh
deno run -A --v8-flags=--expose-gc benchmarks/aiEmbeddingsMemory.ts 1000
deno run -A --v8-flags=--expose-gc benchmarks/aiEmbeddingsMemory.ts 10000
deno run -A --v8-flags=--expose-gc benchmarks/aiEmbeddingsMemory.ts 50000
```

No SDA release is part of this change.
