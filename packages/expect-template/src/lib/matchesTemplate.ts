import { byWord } from "./byWord.js";

export interface Template {
  strings: TemplateStringsArray;
  values: unknown[];
  normalize?: (part: string) => string;
  matchValue?: (part: string) => RegExpMatchArray | null;
}

export interface Mismatch {
  type: "mismatch";
  reason?: string;
  actual: string;
  expected: unknown;
}

export interface Success {
  type: "success";
}

export interface Error {
  type: "error";
  reason?: string;
}

export type Result = Mismatch | Success | Error;

export function matchesTemplate(
  actual: string,
  { strings, values, normalize = (s) => s, matchValue = byWord }: Template,
  equals: (actual: string, expected: unknown) => boolean,
): Result {
  let actualIndex = 0;
  let templateIndex = 0;
  let valueIndex = 0;

  // Normalize all whitespace in the actual string
  actual = normalize(actual);

  while (actualIndex < actual.length && templateIndex < strings.length) {
    // Get and normalize the static part
    const rawExpectedStaticPart = strings[templateIndex];
    const expectedStaticPart = normalize(rawExpectedStaticPart);
    const actualPart = actual.slice(actualIndex);

    if (!actualPart.startsWith(expectedStaticPart)) {
      return {
        type: "mismatch",
        reason: "static part mismatch",
        actual: actualPart.slice(0, expectedStaticPart.length),
        expected: expectedStaticPart,
      };
    }
    actualIndex += expectedStaticPart.length;

    // Try to extract a color from the actual string
    const remainingActual = actual.slice(actualIndex);

    // We're at the last
    if (!remainingActual.length && strings.length === templateIndex + 1) {
      return { type: "success" };
    }

    const match = matchValue(remainingActual);
    const actualMatch = match?.[0];
    const expectedMatcher = values[valueIndex];

    if (actualMatch == null) {
      return {
        type: "mismatch",
        reason: "no value found for matcher",
        actual: remainingActual,
        expected: expectedMatcher,
      };
    }

    /* v8 ignore next 3 */ /* should never happen when used with a valid template */
    if (!expectedMatcher) {
      return { type: "error", reason: "no matcher found" };
    }

    // Handle the matcher
    if (!equals(actualMatch, expectedMatcher)) {
      return {
        type: "mismatch",
        reason: "value mismatch",
        actual: actualMatch,
        expected: expectedMatcher,
      };
    }

    actualIndex += actualMatch.length;
    templateIndex++;
    valueIndex++;
  }

  /* v8 ignore next 6 */ /* else case should never happen when used with a valid template */
  if (actualIndex >= actual.length) {
    return { type: "success" };
  }

  return { type: "error", reason: "template not fully matched" };
}
