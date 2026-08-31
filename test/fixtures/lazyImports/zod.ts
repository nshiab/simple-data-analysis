import { loaded } from "./state.ts";
loaded.push("zod");

export function array(_shape: unknown) {
  return {};
}
export function object(_shape: unknown) {
  return {};
}
export function string() {
  return {};
}
export function toJSONSchema(_schema: unknown) {
  return {};
}
export function fromJSONSchema(_schema: unknown) {
  return { parse: (value: unknown) => value };
}
