import { describe, expect, it } from "vitest";
import { sentence } from "../src/lib/index.js";
import "../src/vitest.js";

describe("with toEqualTemplate", () => {
  it("matches exact templates", () => {
    expect("1px solid black").toMatchTemplate(sentence`1px solid black`);
  });

  it("fails when template is too long", () => {
    expect(() =>
      expect("1px solid black").toMatchTemplate(sentence`1px solid`),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid black"[39m to match template (no value found for matcher)]`,
    );
  });

  it("fails with trailing value", () => {
    // expect("1px solid ").toMatchTemplate(
    //   sentence`1px solid ${expect.stringMatching(/BLACK/i)}`,
    // );

    expect(() =>
      expect("1px solid ").toMatchTemplate(
        sentence`1px solid ${expect.stringMatching(/BLACK/i)}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid "[39m to match template (no value found for matcher)]`,
    );
  });

  it("matches templates", () => {
    expect("1px solid black").toMatchTemplate(
      sentence`1px solid ${expect.stringMatching(/BLACK/i)}`,
    );
  });

  it("fails with matching values in negation", () => {
    expect(() =>
      expect("1px solid black").not.toMatchTemplate(
        sentence`1px solid ${expect.stringContaining("ack")}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid black"[39m not to match template]`,
    );
  });

  it("fails when actual is too short", () => {
    expect(() =>
      expect("1px solid ").toMatchTemplate(
        sentence`1px solid ${expect.stringContaining("ack")}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid "[39m to match template (no value found for matcher)]`,
    );
  });

  it("should fail when values don't match", () => {
    // expect("1px solid grau").toMatchTemplate(
    //   sentence`1px solid ${expect.stringContaining("ack")}`,
    // );

    expect(() =>
      expect("1px solid grau").toMatchTemplate(
        sentence`1px solid ${expect.stringContaining("ack")}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"1px solid grau"[39m to match template (value mismatch)]`,
    );

    // expect("2px solid black").toMatchTemplate(
    //   sentence`1px solid ${expect.stringContaining("ack")}`,
    // );

    expect(() =>
      expect("2px solid black").toMatchTemplate(
        sentence`1px solid ${expect.stringContaining("ack")}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected [31m"2px solid black"[39m to match template (static part mismatch)]`,
    );
  });
});
