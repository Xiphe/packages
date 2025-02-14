import convert from "color-convert";
import parse from "color-parse";
import { isSameColorValuesRounded } from "./isSameColorValuesRounded";

export type ColorSpace =
  | "rgb"
  | "hsl"
  | "hwb"
  | "cmyk"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch"
  | string;

export type Color = {
  space: ColorSpace;
  values: number[];
  alpha: number;
};

export type IsSameColorResultSame = {
  type: "same";
  expected: Color;
  actual: Color;
};
export type IsSameColorResultError = { type: "error"; error: string };
export type IsSameColorResultMismatch = {
  type: "mismatch";
  expected: Color;
  actual: Color;
};

export type IsSameColorResult =
  | IsSameColorResultSame
  | IsSameColorResultError
  | IsSameColorResultMismatch;

export type IsSameColorOptions = {
  precision?: number | "auto";
  allowConversion?: boolean;
};

export function isSameColor(
  expected: string | Color,
  actual: string | Color,
  { precision = 2, allowConversion = true }: IsSameColorOptions = {},
): IsSameColorResult {
  const parsedExpected =
    typeof expected === "string" ? parse(expected) : expected;
  const parsedActual = typeof actual === "string" ? parse(actual) : actual;

  if (!parsedExpected.space) {
    return { type: "error", error: `"${expected}" is not a valid color` };
  }

  if (!parsedActual.space) {
    return { type: "error", error: `"${actual}" is not a valid color` };
  }

  /* Different alpha values create different colors depending on context we cant
    control here, so we assume they are not the same color */
  if (parsedExpected.alpha !== parsedActual.alpha) {
    return { type: "mismatch", expected: parsedExpected, actual: parsedActual };
  }

  /* Same color in same space */
  if (!allowConversion || parsedExpected.space === parsedActual.space) {
    return isSameColorValuesRounded(parsedExpected, parsedActual, precision);
  }

  /* Check if we can convert to the color space */
  if (!(parsedActual.space in convert)) {
    throw new Error(`Unsupported color space: ${parsedActual.space}`);
  }
  const convertFrom = convert[parsedActual.space as keyof typeof convert];

  const expectedSpace = parsedExpected.space as keyof typeof convertFrom;
  /* Check if other incoming colorspace is available as conversion */
  if (!(parsedExpected.space in convertFrom)) {
    throw new Error(`Unsupported color space: ${parsedExpected.space}`);
  }
  const convertTo: unknown = convertFrom[expectedSpace];

  /* v8 ignore next 3 */ /* This is a pre-caution if color-convert might ever extend their interface */
  if (!isConverter(convertTo)) {
    throw new Error(`Unsupported color space: ${parsedExpected.space}`);
  }

  const convertedActual = convertTo.raw(...parsedActual.values);

  return isSameColorValuesRounded(
    parsedExpected,
    {
      space: expectedSpace,
      values: convertedActual,
      alpha: parsedActual.alpha,
    },
    precision,
  );
}

function isConverter(
  convertTo: unknown,
): convertTo is { raw: (...args: number[]) => number[] } {
  return (
    typeof convertTo === "function" &&
    "raw" in convertTo &&
    typeof convertTo.raw === "function"
  );
}
