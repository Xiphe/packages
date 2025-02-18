import type {
  Color,
  IsSameColorResultMismatch,
  IsSameColorResultSame,
} from "./isSameColor.js";

export function isSameColorValuesRounded(
  expected: Color,
  actual: Color,
  precision: number | "auto",
): IsSameColorResultMismatch | IsSameColorResultSame {
  if (
    expected.alpha !== actual.alpha ||
    expected.space !== actual.space ||
    expected.values.length !== actual.values.length
  ) {
    return { type: "mismatch", expected: expected, actual: actual };
  }

  const roundedExpected =
    precision === "auto" || precision === Infinity
      ? expected.values
      : roundValues(expected.values, precision);
  const roundedActual =
    precision === Infinity
      ? actual.values
      : roundValues(
          actual.values,
          precision === "auto" ? expected.values.map(getPrecision) : precision,
        );

  const isSame = roundedExpected.every((v, i) => v === roundedActual[i]);

  if (isSame) {
    return {
      type: "same",
      expected: { ...expected, values: roundedExpected },
      actual: { ...actual, values: roundedActual },
    };
  }

  return {
    type: "mismatch",
    expected: { ...expected, values: roundedExpected },
    actual: { ...actual, values: roundedActual },
  };
}

function roundValues(values: number[], precision: number | number[]) {
  return values.map((value, i) => {
    precision = Array.isArray(precision) ? precision[i] : precision;
    return Math.round(value * 10 ** precision) / 10 ** precision;
  });
}

function getPrecision(num: number): number {
  const str = num.toString();
  const decimalIndex = str.indexOf(".");
  if (decimalIndex === -1) return 0;
  return str.length - decimalIndex - 1;
}
