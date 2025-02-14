import { describe, expect, it } from "vitest";
import "../src/vitest.js";
import { Template } from "../src/lib/compareTemplate.js";

function tmpl(strings: TemplateStringsArray, ...values: unknown[]): Template {
  return {
    strings,
    values,
  };
}

describe("with toEqualTemplate", () => {
  it("should match templates", () => {
    expect("1px solid black").toEqualTemplate(
      tmpl`1px solid ${expect.stringContaining("ack")}`,
    );
  });

  it("should fail when actual is too short", () => {
    expect(() =>
      expect("1px solid ").toEqualTemplate(
        tmpl`1px solid ${expect.stringContaining("ack")}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid "[39m to equal template]`,
    );
  });

  it("should fail when values don't match", () => {
    expect(() =>
      expect("1px solid grau").toEqualTemplate(
        tmpl`1px solid ${expect.stringContaining("ack")}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid grau"[39m to equal template]`,
    );
  });
});
