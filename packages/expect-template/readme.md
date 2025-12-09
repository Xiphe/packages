# expect-template

Make assertions on template literals

## Installation

```bash
npm install expect-template
```

## Usage

### Jest

In you test-setup-file add:

```ts
import "expect-template";
```

### With @jest/globals

In you test-setup-file add:

```ts
import "expect-template/jest-globals";
```

### With Vitest

In you test-setup-file add:

```ts
import "expect-template/vitest";
```

### With another Jest-compatible expect

```ts
import * as matchers from "expect-template/matchers";
import { expect } from "my-test-runner/expect";

expect.extend(matchers);
```

## Usage

```ts
import { sentence } from "expect-template/lib";

it("compares css templates", () => {
  expect("one two three").toMatchTemplate(
    sentence`one two ${expect.stringMatching(/three/i)}`,
  );
});
```
