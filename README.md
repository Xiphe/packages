# expect-color

Make assertions on normalized color

## Installation

```bash
npm install expect-color
```

## Usage

### Jest

In you test-setup-file add:

```ts
import "expect-color";
```

### With @jest/globals

In you test-setup-file add:

```ts
import "expect-color/jest-globals";
```

### With Vitest

In you test-setup-file add:

```ts
import "expect-color/vitest";
```

### With another Jest-compatible expect

```ts
import * as matchers from "expect-color/matchers";
import { expect } from "my-test-runner/expect";

expect.extend(matchers);
```

### Standalone

```ts
import { assertSameColor } from "expect-color/assert";

assertSameColor("red", "red");
```

## Usage

```ts
import { css } from "expect-color/lib";

it("compares colors", () => {
  // Same color in same color space
  expect("rgb(255, 0, 255)").toBeColor("fuchsia");

  // Same color in different color space
  expect("fuchsia").toEqualColor("hsl(300, 100%, 50%)");

  expect({ borderColor: "rgb(255, 0, 255)" }).toEqual({
    borderColor: expect.toBeColor("fuchsia"),
  });
});

it("compares css templates", () => {
  expect("1px solid rgb(0, 0, 0)").toEqualTemplate(
    css`1px solid ${expect.toBeColor("black")}`,
  );
});
```

