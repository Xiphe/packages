import { byWord } from "./byWord.js";
import { Template } from "./matchesTemplate.js";

/**
 * Create a template matcher for common sentences.
 *
 * @example
 * ```ts
 * expect("Hello world").toMatchTemplate(sentence`Hello ${expect.stringContaining("world")}`);
 * ```
 */
export function sentence(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Template {
  return {
    strings,
    values,
    matchValue: byWord,
  };
}
