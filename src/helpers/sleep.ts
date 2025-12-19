import { prettyDuration } from "@nshiab/journalism-format";

export default function sleep(
  ms: number,
  options: { start?: Date; log?: boolean } = {},
): Promise<void> {
  return new Promise((resolve) => {
    if (options.start) {
      const end = new Date();
      const duration = end.getTime() - options.start.getTime();
      const remaining = ms - duration;
      if (remaining > 0) {
        if (options.log) {
          console.log(
            `\nSleeping for ${prettyDuration(0, { end: remaining })}...`,
          );
        }
        return setTimeout(resolve, remaining);
      } else {
        if (options.log) {
          console.log(
            `\nNo need to sleep, already took ${
              prettyDuration(0, { end: duration })
            }.`,
          );
        }
        return resolve();
      }
    }
    return setTimeout(resolve, ms);
  });
}
