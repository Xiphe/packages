import { equalsTemplate } from "../lib/compareTemplate.js";
import { MatcherState } from "./matcherState.js";

export function toEqualTemplate(
  this: MatcherState,
  received: unknown,
  expected: {
    strings: TemplateStringsArray;
    values: unknown[];
    matchValue: (part: string) => RegExpMatchArray | null;
  },
) {
  const {
    equals,
    utils: { printReceived },
  } = this;

  const isEqual = equalsTemplate(String(received), expected, equals);

  return {
    pass: isEqual,
    message: () => {
      if (!isEqual) {
        return `Expected ${printReceived(received)} to equal template`;
      }

      return `Expected ${printReceived(received)} not to equal template`;
    },
    actual: received,
  };
}
