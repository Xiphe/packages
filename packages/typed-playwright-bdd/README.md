# typed-playwright-bdd

**Typed, schema-driven step definitions for BDD frameworks with [playwright-bdd](https://github.com/vitalets/playwright-bdd) signatures.**

`typed-playwright-bdd` provides a typed API for defining BDD steps using tagged template literals and Standard Schema-compliant schemas. It generates regex patterns from JSON Schema and validates arguments at runtime.

## Installation

```bash
npm install typed-playwright-bdd
```

You'll also need a schema library that implements Standard Schema v1, such as [Zod](https://github.com/colinhacks/zod):

```bash
npm install zod
```

## Usage

### Basic Example

```gherkin
Feature: User Registration

  Scenario: Fill in form
    When I fill in my email "john@example.com"
    And I fill "age" with 25
    Then I should see 1 items
```

```typescript
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { createTypedBdd } from "typed-playwright-bdd";
import { z } from "zod";

const { Given, When, Then } = createTypedBdd(createBdd());

When`I fill in my email ${z.email()}`(async ({ page }, email) => {
  await page.getByLabel("Email").fill(email);
});

When`I fill ${z.string()} with ${z.union([z.number(), z.string()])}`(
  async ({ page }, field, value) => {
    await page.getByLabel(new RegExp(field, "i")).fill(value);
  },
);

Then`I should see ${z.number()} items`(async ({ page }, count) => {
  await expect(page.locator(".item").count()).toBe(count);
});
```

### Literal Values

Use literals for exact matches:

```typescript
// "When I click the submit button"
When`I click the ${z.literal("submit")} button`(
  async ({ page }, buttonType) => {
    await page.click(`button[type="${buttonType}"]`);
  },
);
```

### Union of Literals

Create alternatives with unions:

```typescript
const direction = z.union([
  z.literal("left"),
  z.literal("right"),
  z.literal("up"),
  z.literal("down"),
]);

// "When I swipe left"
When`I swipe ${direction}`(async ({ page }, dir) => {
  await page.swipe(dir);
});
```

### Transformations

You can use transformations to transform the value before it is passed to the handler.

```typescript
const booleanSchema = z
  .union([z.literal("true"), z.literal("false")])
  .transform((val) => val === "true");

// "When I set value to true"
When`I set value to ${booleanSchema}`((_, value) => {
  if (value === true) {
    // do something
  } else {
    // do something else
  }
});
```

### Backward Compatibility

The original string-based API remains available:

```typescript
// Traditional approach still works
When("I fill in {string}", (async { page }, value) => {
  await page.fill("input", value);
});

// Mix and match as needed
When`I type ${z.string()}`(async({ page }, text) => {
  await page.keyboard.type(text);
});
```

## How It Works

### Schema to Regex Conversion

`typed-playwright-bdd` converts schemas to regex patterns based on JSON Schema:

| Schema                                      | Matches              | Regex Pattern          |
| ------------------------------------------- | -------------------- | ---------------------- |
| `z.string()`                                | `"hello"`, `'world'` | `["']([^"']+)["']`     |
| `z.number()`                                | `42`, `-3.14`        | `([-+]?\d+(?:\.\d+)?)` |
| `z.literal("test")`                         | `test`               | `(test)`               |
| `z.union([z.literal("a"), z.literal("b")])` | `a`, `b`             | `(a\|b)`               |

## Requirements

### Schema Contract

Schemas **must** implement `StandardSchemaV1` and `StandardJSONSchemaV1` from `@standard-schema/spec`. This means they must provide:

- `schema["~standard"].jsonSchema.input()` — Returns JSON Schema for the input type
- `schema["~standard"].validate(value)` — Validates a value and returns a result

Libraries that support Standard Schema v1:

- [Zod](https://github.com/colinhacks/zod) v4+
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

### BDD Framework Contract

The underlying BDD framework must support:

```typescript
(pattern: string | RegExp, handler: Function) => void
```

With Playwright-style handlers:

```typescript
({ page, ...context }, ...args) => Promise<void> | void
```

Compatible frameworks:

- [playwright-bdd](https://github.com/vitalets/playwright-bdd)
- Any BDD framework with a similar API

## Limitations

### Objects and Arrays (Not Supported in v1)

Complex types like objects and arrays are **not supported** in this version:

```typescript
// ❌ Not supported
When`I submit ${z.object({ name: z.string() })}`(...)
When`I select ${z.array(z.string())}`(...)
```

**Reason:** Regex-based parsing cannot reliably handle nested JSON structures. This may be added in a future version with explicit opt-in.

### Whitespace Matching

Whitespace in templates is matched literally:

```typescript
// These are different patterns:
When`I fill in  ${z.string()}`; // Two spaces
When`I fill in ${z.string()}`; // One space
```

## License

MIT

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/Xiphe/packages).
