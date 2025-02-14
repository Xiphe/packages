import "vitest";
import { type ColorMatchers } from "./matchers";

declare module "vitest" {
  interface Assertion extends ColorMatchers {}
  interface AsymmetricMatchersContaining extends ColorMatchers {}
}
