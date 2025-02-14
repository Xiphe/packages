import "vitest";
import { type ColorMatchers } from "./matchers.js";

declare module "vitest" {
  interface Assertion extends ColorMatchers {}
  interface AsymmetricMatchersContaining extends ColorMatchers {}
}
export {};
