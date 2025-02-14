import { describe, expect, it } from "vitest";
import "../src/vitest";

describe("expect.toEqualColor", () => {
  it("compares colors", () => {
    expect({ color: "red" }).toEqual({
      color: expect.toEqualColor("rgb(255, 0, 0)"),
    });
  });
});
