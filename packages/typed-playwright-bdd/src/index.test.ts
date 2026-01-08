import { describe, it, expect, vi, Mock } from "vitest";
import { z } from "zod";
import { BddApi, createTypedBdd, StepDefiner } from "./index.js";

function createMockBDD<Context = any>() {
  const Given = vi.fn();
  const When = vi.fn();
  const Then = vi.fn();
  return {
    Given: Given as StepDefiner<Context, any[]>,
    When: When as StepDefiner<Context, any[]>,
    Then: Then as StepDefiner<Context, any[]>,
    mocks: {
      Given,
      When,
      Then,
    },
    call: {
      When(input: string, context?: any) {
        const [pattern, wrappedHandler] = When.mock.calls[0];
        const match = input.match(pattern);
        const matches = match?.slice(1);
        return wrappedHandler(context, ...(matches ?? []));
      },
    },
  };
}

describe("typed-playwright-bdd", () => {
  describe("createTypedBdd", () => {
    it("preserves original string-based API", () => {
      const baseBdd = createMockBDD();

      const typed = createTypedBdd(baseBdd);

      const handler = async () => {};
      typed.When("I do something", handler);

      expect(baseBdd.When).toHaveBeenCalledWith("I do something", handler);
    });

    it("supports tagged template with string schema", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.string()}`(({ page }, value) => {
        page.toLowerCase();
        value.toUpperCase();
      });

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern, wrappedHandler] = baseBdd.mocks.When.mock.calls[0];

      // Check pattern is a RegExp
      expect(pattern).toBeInstanceOf(RegExp);
      expect(pattern.source).toBe("^I fill in [\"']([^\"']+)[\"']$");
      expect("I fill in 'hello'").toMatch(pattern);
    });

    it("supports transformations", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);
      const booleanSchema = z
        .union([z.literal("true"), z.literal("false")])
        .transform((val) => val === "true");

      typed.When`I set value to ${booleanSchema}`((_, value) => {
        expect(value).toBe(false);
      });

      baseBdd.call.When("I set value to false");
    });

    it("supports tagged template with number schema", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.number()}`(({ page }, count) => {
        page.toLowerCase();
        count.toFixed(2);
      });

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe("^I fill in ([-+]?\\d+(?:\\.\\d+)?)$");
      expect("I fill in -3.14").toMatch(pattern);
    });

    it("supports tagged template with literal schema", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.literal("blank")}`(({ page }, literal) => {
        page.toLowerCase();
        literal.toUpperCase();
      });

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe("^I fill in (blank)$");
      expect("I fill in blank").toMatch(pattern);
    });

    it("supports tagged template with enum schema", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.enum(["blank", "filled"])}`(
        ({ page }, literal) => {
          page.toLowerCase();
          literal.toUpperCase();
        },
      );

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe("^I fill in (blank|filled)$");
      expect("I fill in blank").toMatch(pattern);
    });

    it("supports tagged template with union of literals", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      const schema = z.union([z.literal("bla"), z.literal("bli blub")]);
      typed.When`I fill in ${schema}`(({ page }, value) => {
        page.toLowerCase();
        value.toUpperCase();
      });

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe("^I fill in (bla|bli blub)$");
      expect("I fill in bla").toMatch(pattern);
    });

    it("supports mixed schemas in union", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      const schema = z.union([z.literal("bla"), z.string(), z.number()]);
      typed.When`I fill in ${schema}`(({ page }, value) => {
        page.toLowerCase();

        // @ts-expect-error - value is string or number
        value.toUpperCase();
      });

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe(
        "^I fill in (bla|[\"'][^\"']+[\"']|[-+]?\\d+(?:\\.\\d+)?)$",
      );
      expect("I fill in bla").toMatch(pattern);
      expect("I fill in 'hello'").toMatch(pattern);
      expect("I fill in -3.14").toMatch(pattern);
    });

    it("supports multiple schema slots", () => {
      const baseBdd = createMockBDD<{ page: number }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.string()} with ${z.number()}`(
        ({ page }, text, count) => {
          page.toFixed();
          text.toUpperCase();
          count.toFixed(2);
        },
      );

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe(
        "^I fill in [\"']([^\"']+)[\"'] with ([-+]?\\d+(?:\\.\\d+)?)$",
      );
      expect("I fill in 'hello' with 42").toMatch(pattern);
    });

    it("escapes special regex characters in literal text", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I click (special) ${z.string()}`((ctx, value) => {
        value.toUpperCase();
        void ctx;
      });

      expect(baseBdd.When).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.When.mock.calls[0];
      expect(pattern.source).toBe(
        "^I click \\(special\\) [\"']([^\"']+)[\"']$",
      );
      expect("I click (special) 'hello'").toMatch(pattern);
    });

    it("validates and parses string values at runtime", async () => {
      expect.assertions(1);
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.string()}`((_, value: string) => {
        expect(value).toBe("hello world");
      });

      baseBdd.call.When('I fill in "hello world"', { page: {} });
    });

    it("validates and parses number values at runtime", async () => {
      expect.assertions(2);
      const baseBdd = createMockBDD<{ page: number }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.coerce.number()}`(({ page }, count) => {
        expect(page).toBe("some");
        expect(count).toBe(42);
      });

      baseBdd.call.When("I fill in 42", { page: "some" });
    });

    it("validates and parses negative numbers at runtime", async () => {
      expect.assertions(2);
      const baseBdd = createMockBDD<{ page: number }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.coerce.number()}`(({ page }, count) => {
        expect(page).toBe("some");
        expect(count).toBe(-3.14);
      });

      baseBdd.call.When("I fill in -3.14", { page: "some" });
    });

    it("throws validation error on invalid schema value", async () => {
      const baseBdd = createMockBDD<{ page: number }>();
      const typed = createTypedBdd(baseBdd);

      typed.When`I fill in ${z.coerce.number()}`(({ page }, count) => {
        count.toFixed(2);
      });

      const [, wrappedHandler] = baseBdd.mocks.When.mock.calls[0];
      await expect(
        wrappedHandler({ page: {} }, "not-a-number"),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Validation failed for argument 0: [{"expected":"number","code":"invalid_type","received":"NaN","path":[],"message":"Invalid input: expected number, received NaN"}]]`,
      );
    });

    it("works with Given step", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.Given`I have ${z.string()}`(({ page }, value: string) => {
        void page;
        void value;
      });

      expect(baseBdd.Given).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.Given.mock.calls[0];
      expect(pattern).toBeInstanceOf(RegExp);
      expect("I have 'hello'").toMatch(pattern);
    });

    it("works with Then step", () => {
      const baseBdd = createMockBDD<{ page: string }>();
      const typed = createTypedBdd(baseBdd);

      typed.Then`I should see ${z.string()}`(({ page }, value: string) => {
        void page;
        void value;
      });

      expect(baseBdd.Then).toHaveBeenCalledTimes(1);
      const [pattern] = baseBdd.mocks.Then.mock.calls[0];
      expect(pattern).toBeInstanceOf(RegExp);
      expect("I should see 'hello'").toMatch(pattern);
    });
  });

  describe("out of scope", () => {
    it("does not support objects", () => {
      expect(() => {
        createTypedBdd(createMockBDD()).When`I fill in ${z.object({
          name: z.string(),
        })}`(() => {});
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: Unsupported schema: {"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}]`,
      );
    });

    it("does not support arrays", () => {
      expect(() => {
        createTypedBdd(createMockBDD()).When`I fill in ${z.array(z.string())}`(
          () => {},
        );
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: Unsupported schema: {"type":"array","items":{"type":"string"}}]`,
      );
    });
  });
});
