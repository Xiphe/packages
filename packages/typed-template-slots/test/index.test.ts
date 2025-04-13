import {
  tagSlots,
  interpolate,
  slot,
  createInterpolator,
} from "../src/index.js";
import { describe, it, expect } from "vitest";

describe("TypeSlot Usage", () => {
  describe("Basic usage", () => {
    it("should create templates with slots and interpolate values", () => {
      const template = tagSlots`Hello ${slot("name")}!`;
      const result = interpolate(template, { name: "World" });

      expect(result).toBe("Hello World!");
    });

    it("should handle multiple slots", () => {
      const template = tagSlots`${slot("greeting")} ${slot(
        "name",
      )}, how are you?`;
      const result = interpolate(template, {
        greeting: "Hello",
        name: 2,
      });

      expect(result).toBe("Hello 2, how are you?");
    });

    it("should allow basic string interpolation", () => {
      const template = tagSlots`Hello ${"world"}!`;
      const result = interpolate(template, {});

      expect(result).toBe("Hello world!");
    });

    it("should throw on unknown slot types", () => {
      expect(() => {
        // @ts-expect-error - Intentionally passing invalid object to test runtime error
        tagSlots`Hello ${{ custom: "slot" }}!`;
      }).toThrow(/Invalid value type/);
    });
  });

  describe("curried usage", () => {
    it("should create a curried function", () => {
      const template = tagSlots`Hello ${slot("name")}!`;
      const greet = interpolate(template);

      expect(greet({ name: "World" })).toBe("Hello World!");
    });
  });

  describe("Error handling", () => {
    it("should handle missing slots in non-production mode", () => {
      const template = tagSlots`Hello ${slot("name")}!`;

      expect(() => {
        // @ts-expect-error - Intentionally passing empty object to test runtime error
        interpolate(template, {});
      }).toThrow(/Slot name not found/);
    });

    it("should use empty strings for missing slots in production mode", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const template = tagSlots`Hello ${slot("name")}!`;
      // @ts-expect-error - Intentionally passing empty object to test production behavior
      const result = interpolate(template, {});

      expect(result).toBe("Hello !");

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe("pre-compiled templates", () => {
    it("should work with pre-compiled templates", () => {
      const template = ["Hello ", slot("name"), "!"];
      const result = interpolate(template, { name: "World" });

      expect(result).toBe("Hello World!");
    });
  });

  describe("Custom interpolators", () => {
    it("should create custom interpolator with specialized handling", () => {
      const interpolate = createInterpolator({
        onMissingSlot: (slotName) => `[${slotName} missing]`,
        text: (text) => text,
        slot: (value: number) => String(value * 2),
        compose: (tokens) => tokens,
      });

      const template = tagSlots`Math: ${slot("x")} + ${slot("y")}`;
      const result = interpolate(template, { x: 2, y: 6 });
      expect(result).toEqual(["Math: ", "4", " + ", "12"]);

      // @ts-expect-error - Intentionally passing empty object to test runtime error
      expect(interpolate(template, {})).toEqual([
        "Math: ",
        "[x missing]",
        " + ",
        "[y missing]",
      ]);
    });
  });

  describe("async templates", () => {
    it("should support creation of partial/async templates", () => {
      const en = tagSlots`Hello ${slot("name")} and ${slot("name2")}!`;
      const es: typeof en = tagSlots`Hola ${slot("name")}!`;
      // es does not need to use all slots of en

      const greet = interpolate(es);
      expect(greet({ name: "world", name2: "UNUSED" })).toBe("Hola world!");
      // @ts-expect-error - we must provide all slots even when not used
      expect(greet({ name: "world" })).toBe("Hola world!");
    });
  });
});
