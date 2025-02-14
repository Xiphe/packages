interface MatcherUtils {
  printReceived: (value: unknown) => string;
  printExpected: (value: unknown) => string;
}

export interface MatcherState {
  equals: (actual: string, expected: unknown) => boolean;
  utils: MatcherUtils;
  isNot?: boolean;
}
