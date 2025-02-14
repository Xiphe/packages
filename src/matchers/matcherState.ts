interface MatcherUtils {
  printReceived: (value: unknown) => string;
  printExpected: (value: unknown) => string;
}

export interface MatcherState {
  utils: MatcherUtils;
  isNot?: boolean;
}
