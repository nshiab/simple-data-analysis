import { test, type TestOptions } from "vite-plus/test";

type TestFunction = () => void | Promise<void>;
type EnvironmentTest = {
  (name: string, fn: TestFunction): void;
  (name: string, options: TestOptions, fn: TestFunction): void;
};

/** Creates tests that temporarily set and then restore provider variables. */
export default function createEnvironmentTest(
  environment: Record<string, string>,
): EnvironmentTest {
  return (
    name: string,
    optionsOrFunction: TestOptions | TestFunction,
    possibleFunction?: TestFunction,
  ) => {
    const options = typeof optionsOrFunction === "function" ? {} : optionsOrFunction;
    const fn = typeof optionsOrFunction === "function" ? optionsOrFunction : possibleFunction;
    if (!fn) throw new Error(`No test function provided for ${name}.`);
    test(name, options, async () => {
      const previousValues = new Map<string, string | undefined>();
      for (const [key, value] of Object.entries(environment)) {
        previousValues.set(key, process.env[key]);
        process.env[key] = value;
      }
      try {
        await fn();
      } finally {
        for (const [key, value] of previousValues) {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        }
      }
    });
  };
}
