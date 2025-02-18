interface MatcherUtils {
  diff: (actual: unknown, expected: unknown) => string | undefined;
  printReceived: (value: unknown) => string;
  printExpected: (value: unknown) => string;
}

export interface MatcherState {
  equals: (actual: string, expected: unknown) => boolean;
  utils: MatcherUtils;
  isNot?: boolean;
}
