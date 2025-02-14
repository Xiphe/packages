import { describe, expect, it } from "vitest";
import "../src/vitest";
import { Color } from "../src/lib/isSameColor";

describe("toEqualColor", () => {
  it("compares keyword with keyword", () => {
    expect("red").toEqualColor("red");

    expect("red").not.toEqualColor("blue");

    expect(() =>
      expect("red").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"red"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("red").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"red"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares hex with keyword", () => {
    expect("#ff0000").toEqualColor("red");
    expect("red").toEqualColor("#ff0000");

    expect("#ff0000").not.toEqualColor("blue");
    expect("red").not.toEqualColor("#0000ff");

    expect(() =>
      expect("#ff0000").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"#ff0000"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("#ff0000").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"#ff0000"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares alpha-hex with keyword", () => {
    expect("#ff0000ff").toEqualColor("red");
    expect("red").toEqualColor("#ff0000ff");

    expect("#ff0000ff").not.toEqualColor("blue");
    expect("red").not.toEqualColor("#0000ffff");

    expect(() =>
      expect("#ff0000ff").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"#ff0000ff"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("#ff0000ff").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"#ff0000ff"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares rgb with keyword", () => {
    expect("rgb(255, 0, 0)").toEqualColor("red");
    expect("red").toEqualColor("rgb(255, 0, 0)");

    expect("rgb(255, 0, 0)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("rgb(0, 0, 255)");

    expect(() =>
      expect("rgb(255, 0, 0)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"rgb(255, 0, 0)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("rgb(255, 0, 0)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"rgb(255, 0, 0)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares rgba with keyword", () => {
    expect("rgba(255, 0, 0, 1)").toEqualColor("red");
    expect("red").toEqualColor("rgba(255, 0, 0, 1)");

    expect("rgba(255, 0, 0, 1)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("rgba(0, 0, 255, 1)");

    expect(() =>
      expect("rgba(255, 0, 0, 1)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"rgba(255, 0, 0, 1)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("rgba(255, 0, 0, 1)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"rgba(255, 0, 0, 1)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares hsl with keyword", () => {
    expect("hsl(0, 100%, 50%)").toEqualColor("red");
    expect("red").toEqualColor("hsl(0, 100%, 50%)");

    expect("hsl(0, 100%, 50%)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("hsl(0, 0%, 100%)");

    expect(() =>
      expect("hsl(0, 100%, 50%)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"hsl(0, 100%, 50%)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("hsl(0, 100%, 50%)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"hsl(0, 100%, 50%)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares hsv with keyword", () => {
    expect("hsv(0, 100%, 100%)").toEqualColor("red");
    expect("red").toEqualColor("hsv(0, 100%, 100%)");

    expect("hsv(0, 100%, 100%)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("hsv(0, 0%, 100%)");

    expect(() =>
      expect("hsv(0, 100%, 100%)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"hsv(0, 100%, 100%)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("hsv(0, 100%, 100%)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"hsv(0, 100%, 100%)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares hwb with keyword", () => {
    expect("hwb(0, 0, 0)").toEqualColor("red");
    expect("red").toEqualColor("hwb(0, 0, 0)");

    expect("hwb(0, 0, 0)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("hwb(0, 0, 100%)");

    expect(() =>
      expect("hwb(0, 0, 0)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"hwb(0, 0, 0)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("hwb(0, 0, 0)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"hwb(0, 0, 0)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares cmyk with keyword", () => {
    expect("cmyk(0, 100, 100, 0)").toEqualColor("red");
    expect("red").toEqualColor("cmyk(0, 100, 100, 0)");

    expect("cmyk(0, 100, 100, 0)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("cmyk(0, 0, 0, 100%)");

    expect(() =>
      expect("cmyk(0, 100, 100, 0)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"cmyk(0, 100, 100, 0)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("cmyk(0, 100, 100, 0)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"cmyk(0, 100, 100, 0)"[39m not to equal color [31m"red"[39m]`,
    );
  });
  it("compares xyz with keyword", () => {
    expect("xyz(41.25, 21.27, 1.93)").toEqualColor("red");
    expect("red").toEqualColor("xyz(41.25, 21.27, 1.93)");

    expect("xyz(41.25, 21.27, 1.93)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("xyz(0, 0, 0)");

    expect(() =>
      expect("xyz(41.25, 21.27, 1.93)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"xyz(41.25, 21.27, 1.93)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("xyz(41.25, 21.27, 1.93)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"xyz(41.25, 21.27, 1.93)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares lab with keyword", () => {
    expect("red").toEqualColor("lab(53, 80, 67)");
    expect("lab(53.24, 80.09, 67.20)").toEqualColor("red");

    expect("lab(53.24, 80.09, 67.20)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("lab(0, 0, 0)");

    expect(() =>
      expect("lab(53.24, 80.09, 67.20)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"lab(53.24, 80.09, 67.20)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("lab(53.24, 80.09, 67.20)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"lab(53.24, 80.09, 67.20)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("compares lch with keyword", () => {
    expect("red").toEqualColor("lch(53, 105, 40)");
    expect("lch(53, 105, 40)").toEqualColor("red");

    expect("lch(53, 105, 40)").not.toEqualColor("blue");
    expect("red").not.toEqualColor("lch(0, 0, 0)");

    expect(() =>
      expect("lch(53, 105, 40)").toEqualColor("blue"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"lch(53, 105, 40)"[39m to equal color [32m"blue"[39m]`,
    );
    expect(() =>
      expect("lch(53, 105, 40)").not.toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"lch(53, 105, 40)"[39m not to equal color [31m"red"[39m]`,
    );
  });

  it("throws with unknown color", () => {
    expect(() =>
      expect("ney ney ney").toEqualColor("red"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: "ney ney ney" is not a valid color]`,
    );

    expect(() =>
      expect("red").toEqualColor("nope"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: "nope" is not a valid color]`,
    );
  });

  it("has precision options", () => {
    // Basic precision, rounding towards expected
    expect("xyz(41.1, 21.1, 1.9)").toEqualColor("red");
    // Manually increase precision breaks this
    expect(() => {
      expect("xyz(41.1, 21.1, 1.9)").toEqualColor("red", { precision: 1 });
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"xyz(41.1, 21.1, 1.9)"[39m to equal color [32m"red"[39m]`,
    );

    // Increase accuracy
    expect("xyz(41.2, 21.2, 1.9)").toEqualColor("red", { precision: 1 });
    // Further increase precision breaks this
    expect(() => {
      expect("xyz(41.1, 21.1, 1.9)").toEqualColor("red", { precision: 1 });
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"xyz(41.1, 21.1, 1.9)"[39m to equal color [32m"red"[39m]`,
    );

    // Increase accuracy
    expect("xyz(41.16, 21.1, 1.9)").toEqualColor("red", { precision: 2 });
    // Further increase precision breaks this
    expect(() => {
      expect("xyz(41.16, 21.1, 1.9)").toEqualColor("red", { precision: 3 });
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"xyz(41.16, 21.1, 1.9)"[39m to equal color [32m"red"[39m]`,
    );

    expect("red").toEqualColor("xyz(41.24564, 21.26729, 1.9333900000000002)", {
      precision: Infinity,
    });
  });

  it("proclaims different alpha values as mismatch", () => {
    expect(() => {
      expect("#000000ff").toEqualColor("rgba(0,0,0,0.5)");
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"#000000ff"[39m to equal color [32m"rgba(0,0,0,0.5)"[39m]`,
    );
  });

  it("supports pre-parsed color object", () => {
    expect({
      alpha: 1,
      space: "rgb",
      values: [255, 0, 0],
    } satisfies Color).toEqualColor({
      alpha: 1,
      space: "cmyk",
      values: [0, 100, 100, 0],
    });
  });

  it("gracefully handles unsupported color-spaces", () => {
    expect(() => {
      expect({
        alpha: 1,
        space: "schwup",
        values: [255, 0, 0],
      } satisfies Color).toEqualColor("red");
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported color space: schwup]`,
    );

    expect(() => {
      expect("red").toEqualColor({
        alpha: 1,
        space: "zack",
        values: [0, 100, 100, 0],
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported color space: zack]`,
    );
  });

  it("gracefully handles malformed colors", () => {
    expect(() => {
      expect({
        alpha: 1,
        space: "rgb",
        values: [255, 0, 0, 0],
      } satisfies Color).toEqualColor({
        alpha: 1,
        space: "rgb",
        values: [255, 0, 0],
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `
      [Error: Expected [31mObject {
        "alpha": 1,
        "space": "rgb",
        "values": Array [
          255,
          0,
          0,
          0,
        ],
      }[39m to equal color [32mObject {
        "alpha": 1,
        "space": "rgb",
        "values": Array [
          255,
          0,
          0,
        ],
      }[39m]
    `,
    );
  });
});
