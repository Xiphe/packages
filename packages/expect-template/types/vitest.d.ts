import "vitest";
import { type TemplateMatchers } from "./matchers.js";

declare module "vitest" {
  interface Assertion extends TemplateMatchers<void> {}
  interface AsymmetricMatchersContaining
    extends TemplateMatchers<{
      sample: string[];
    }> {}
}
export {};
