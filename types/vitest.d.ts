import "vitest";
import { type ColorMatchers } from "./matchers.js";

declare module "vitest" {
  interface Assertion extends ColorMatchers<void> {}
  interface AsymmetricMatchersContaining
    extends ColorMatchers<{
      sample: string[];
    }> {}
}
export {};
