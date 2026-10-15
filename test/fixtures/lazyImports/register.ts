import { registerHooks } from "node:module";

const scenario = process.env.SDA_LAZY_SCENARIO;
const fixtures: Record<string, string> = {
  "@nshiab/journalism-dataviz": "dataviz",
  "@nshiab/journalism-google": scenario === "failure" ? "googleFailure" : "google",
  "@nshiab/journalism-ai": "ai",
  "@nshiab/journalism-format": "format",
  zod: "zod",
  ollama: "ollama",
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    const fixture = fixtures[specifier];
    if (fixture) return { url: new URL(`${fixture}.ts`, import.meta.url).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
