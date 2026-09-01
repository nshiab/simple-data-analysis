type TestOptions = Omit<Deno.TestDefinition, "name" | "fn">;
type TestFunction = Deno.TestDefinition["fn"];

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
    const options = typeof optionsOrFunction === "function"
      ? {}
      : optionsOrFunction;
    const fn = typeof optionsOrFunction === "function"
      ? optionsOrFunction
      : possibleFunction;
    if (!fn) {
      throw new Error(`No test function provided for ${name}.`);
    }

    Deno.test({
      name,
      ...options,
      fn: async (context) => {
        const previousValues = new Map<string, string | undefined>();
        for (const [key, value] of Object.entries(environment)) {
          previousValues.set(key, Deno.env.get(key));
          Deno.env.set(key, value);
        }
        try {
          await fn(context);
        } finally {
          for (const [key, value] of previousValues) {
            if (value === undefined) {
              Deno.env.delete(key);
            } else {
              Deno.env.set(key, value);
            }
          }
        }
      },
    });
  };
}
