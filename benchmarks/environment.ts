export function requiredEnvironment(name: string): string {
  const value = Deno.env.get(name);
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value;
}
