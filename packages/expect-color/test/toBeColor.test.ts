import { describe, expect, it } from "vitest";
import "../src/vitest.js";

describe("toBeColor", () => {
  it("compares keyword with keyword", () => {
    expect("red").toBeColor("red");
    expect("red").not.toBeColor("blue");
    expect(() => {
      expect("red").not.toBeColor("red");
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"red"[39m not to be color [31m"red"[39m]`,
    );
  });

  it("compares hex with rgb (same space)", () => {
    expect("#ff0000").toBeColor("rgb(255, 0, 0)");
    expect("rgb(255, 0, 0)").toBeColor("#ff0000");
  });

  it("gracefully handles invalid colors", () => {
    expect(() => {
      expect("red").toBeColor("knurz");
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: "knurz" is not a valid color]`,
    );
  });

  it("does not convert colors", () => {
    expect(() => {
      expect("red").toBeColor("cmyk(0, 100, 100, 0)");
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"red"[39m to be color [32m"cmyk(0, 100, 100, 0)"[39m]`,
    );
  });
});
