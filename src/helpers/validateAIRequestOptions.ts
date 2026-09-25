/** Validates scheduling options before reading rows or changing table metadata. */
export default function validateAIRequestOptions(options: {
  concurrency?: number;
  rateLimitPerMinute?: number;
}): void {
  const concurrency = options.concurrency ?? 1;
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
    throw new Error("concurrency must be a positive safe integer.");
  }
  if (
    options.rateLimitPerMinute !== undefined &&
    (!Number.isFinite(options.rateLimitPerMinute) ||
      options.rateLimitPerMinute <= 0 ||
      !Number.isFinite(60_000 / options.rateLimitPerMinute))
  ) {
    throw new Error(
      "rateLimitPerMinute must be greater than 0 and produce a finite request interval.",
    );
  }
}
