import { ExpectColorOptions } from "./config.js";
import { Color, isSameColor } from "./lib/index.js";

export function assertSameColor(
  expected: string | Color,
  actual: string | Color,
  options?: ExpectColorOptions,
) {
  const result = isSameColor(expected, actual, options);

  if (result.type === "same") {
    return;
  }

  if (result.type === "error") {
    throw new Error(result.error);
  }

  throw new Error(
    `Expected ${printColor(actual)} to be color ${printColor(
      expected,
    )}\n\n  Expected: ${printColor(result.expected)}\n  Actual: ${printColor(
      result.actual,
    )}`,
  );
}

function printColor(color: string | Color) {
  if (typeof color === "string") {
    return color;
  }
  return JSON.stringify(color);
}
