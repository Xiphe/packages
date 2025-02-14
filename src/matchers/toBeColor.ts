import { isSameColor } from "../lib";
import { MatcherState } from "./matcherState";

export function toBeColor(
  this: MatcherState,
  received: string,
  expected: string,
) {
  const result = isSameColor(expected, received, {
    precision: Infinity,
    allowConversion: false,
  });
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
        ? `Expected ${printReceived(received)} not to be color ${printReceived(
            expected,
          )}`
        : `Expected ${printReceived(received)} to be color ${printExpected(
            expected,
          )}`;
    },
    actual: result.type === "mismatch" ? result.actual : undefined,
    expected: result.type === "mismatch" ? result.expected : undefined,
  };
}
