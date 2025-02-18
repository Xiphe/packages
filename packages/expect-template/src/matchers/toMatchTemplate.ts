import { matchesTemplate, Template } from "../lib/index.js";
import { MatcherState } from "./matcherState.js";

export function toMatchTemplate(
  this: MatcherState,
  received: unknown,
  expected: Template,
) {
  const {
    equals,
    utils: { printReceived },
  } = this;

  const isEqual = matchesTemplate(String(received), expected, equals);

  const pass = isEqual.type === "success";
  const actual = "actual" in isEqual ? isEqual.actual : undefined;
  const expectedValue =
    "expected" in isEqual ? prepareExpected(isEqual.expected) : undefined;

  return {
    pass,
    message: () => {
      return `Expected ${printReceived(received)} ${
        pass ? "not to" : "to"
      } match template${
        "reason" in isEqual && isEqual.reason?.length
          ? ` (${isEqual.reason})`
          : ""
      }`;
    },
    actual,
    expected: expectedValue,
  };
}

function prepareExpected(expected: unknown) {
  if (
    typeof expected === "object" &&
    expected !== null &&
    "sample" in expected
  ) {
    const sample =
      ((typeof expected.sample === "object" ||
        typeof expected.sample === "function") &&
      expected.sample !== null &&
      "toString" in expected.sample
        ? expected.sample.toString()
        : String(expected.sample)) || "";

    return `<${expected.toString()} ${sample}>`;
  }

  return expected;
}
