import { describe, expect, it } from "vitest";
import { css } from "../src/lib/css.js";
import "../src/vitest.js";

const styles = `
  background-color: #000;
  color: #fff;
  border: 1px solid #000;
`;

describe("css", () => {
  it("should match identical strings", () => {
    expect("1px solid black").toEqualTemplate(css`1px solid black`);
  });

  it("should fail when strings are not identical", () => {
    expect("1px solid black").not.toEqualTemplate(css`1px solid white`);
    expect(() =>
      expect("1px solid black").toEqualTemplate(css`1px solid white`),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid black"[39m to equal template]`,
    );
    expect(() =>
      expect("1px solid black").not.toEqualTemplate(css`1px solid black`),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid black"[39m not to equal template]`,
    );
  });

  it("should match when colors are equivalent", () => {
    expect("1px solid rgb(0, 0, 0)").toEqualTemplate(
      css`1px solid ${expect.toEqualColor("#000")}`,
    );
  });

  it("should handle whitespace", () => {
    expect("  1px solid   rgb(0, 0, 0)  ").toEqualTemplate(
      css`1px solid ${expect.toEqualColor("#000")}`,
    );
  });

  it("should match multiple colors in CSS", () => {
    expect(styles).toEqualTemplate(
      css`
        background-color: ${expect.toEqualColor("black")};
        color: ${expect.toEqualColor("white")};
        border: 1px solid ${expect.toEqualColor("hsl(0, 0%, 0%)")};
      `,
    );
  });

  it("should handle various whitespace patterns", () => {
    expect(`
      background-color:    #000;
      color:
      #fff;
      border:    1px    solid    #000;
    `).toEqualTemplate(
      css`
        background-color: ${expect.toEqualColor("black")};
        color: ${expect.toEqualColor("white")};
        border: 1px solid ${expect.toEqualColor("black")};
      `,
    );
  });

  it("should handle various CSS values", () => {
    expect(`
      width: 100px;
      background: url("image.jpg");
      padding: calc(2rem + 15px);
      content: "Hello world";
      --custom-prop: var(--other-prop);
      transform: rotate(45deg);
    `).toEqualTemplate(
      css`
        width: ${expect.any(String)};
        background: ${expect.stringMatching(/^url\(".*"\)$/)};
        padding: ${expect.stringMatching(/^calc\(.*\)$/)};
        content: ${expect.stringContaining("Hello")};
        --custom-prop: ${expect.stringMatching(/^var\(--.*\)$/)};
        transform: ${expect.stringMatching(/^rotate\(\d+deg\)$/)};
      `,
    );
  });
});
