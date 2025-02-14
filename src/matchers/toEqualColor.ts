import { config, ExpectColorOptions } from "../config.js";
import { isSameColor } from "../lib/index.js";
import { MatcherState } from "./matcherState.js";

export function toEqualColor(
  this: MatcherState,
  received: string,
  expected: string,
  options?: ExpectColorOptions,
) {
  const optionsWithDefaults = { ...config, ...options };
  const result = isSameColor(expected, received, optionsWithDefaults);
  const {
    utils: { printReceived, printExpected },
  } = this;

  return {
    pass: result.type === "same",
    message: () => {
      if (result.type === "error") {
        return result.error;
      }

      return result.type === "same"
        ? `Expected ${printReceived(
            received,
          )} not to equal color ${printReceived(expected)}`
        : `Expected ${printReceived(received)} to equal color ${printExpected(
            expected,
          )}`;
    },
    actual: result.type === "mismatch" ? result.actual : undefined,
    expected: result.type === "mismatch" ? result.expected : undefined,
  };
}
