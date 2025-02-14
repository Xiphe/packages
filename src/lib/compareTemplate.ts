export interface Template {
  strings: TemplateStringsArray;
  values: unknown[];
  normalize?: (part: string) => string;
  matchValue?: (part: string) => RegExpMatchArray | null;
}

export function equalsTemplate(
  actual: string,
  {
    strings,
    values,
    normalize = (s) => s,
    matchValue = (s) => s.match(/^[^\s]+/),
  }: Template,
  equals: (actual: string, expected: unknown) => boolean,
) {
  let actualIndex = 0;
  let templateIndex = 0;
  let valueIndex = 0;

  // Normalize all whitespace in the actual string
  actual = normalize(actual);

  while (actualIndex < actual.length && templateIndex < strings.length) {
    // Get and normalize the static part
    const staticPart = normalize(strings[templateIndex]);
    const actualPart = actual.slice(actualIndex);

    if (!actualPart.startsWith(staticPart)) {
      return false;
    }
    actualIndex += staticPart.length + 1;

    // If we're at the last static part, we're done
    if (templateIndex === strings.length - 1) {
      return actualIndex >= actual.length;
    }
    // Try to extract a color from the actual string
    const remainingActual = actual.slice(actualIndex);
    const match = matchValue(remainingActual);

    if (!match) {
      return false;
    }

    const actualMatch = match[0];
    const expectedMatcher = values[valueIndex];

    // Handle the color matcher
    /* v8 ignore next 3 */ /* should never happen when used with a valid template */
    if (!expectedMatcher) {
      return false;
    }

    if (!equals(actualMatch, expectedMatcher)) {
      return false;
    }

    actualIndex += actualMatch.length;
    templateIndex++;
    valueIndex++;
  }

  return actualIndex >= actual.length;
}
