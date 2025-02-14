import { describe, expect, it } from "vitest";
import { assertSameColor } from "../src/assert";

describe("assertSameColor", () => {
  it("should be a function", () => {
    expect(() => {
      assertSameColor("fuchsia", "rgb(255, 0, 255)");
    }).not.toThrow();
  });

  it("should throw if the colors are not the same", () => {
    expect(() => {
      assertSameColor("red", "blue");
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: Expected blue to be color red

        Expected: {"space":"rgb","values":[255,0,0],"alpha":1}
        Actual: {"space":"rgb","values":[0,0,255],"alpha":1}]
    `);
  });

  it("throws on invalid colors", () => {
    expect(() => {
      assertSameColor("red", "invalid");
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: "invalid" is not a valid color]`,
    );
  });
});
