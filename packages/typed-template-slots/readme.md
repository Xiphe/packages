# typed-template-slots

tiny, type-safe template literals with named slots.

## Installation

```bash
npm install typed-template-slots
```

## Usage


```ts
import { tagSlots, slot, interpolate } from "typed-template-slots";

const template = tagSlots`Hello ${slot("name")}!`;
// `template` is JSON serializable array which can be sent over the network

const result = interpolate(template, { name: "world" });
console.log(result);
// "Hello earth!"

// ----- OR curried usage -----

const greet = interpolate(template);
// `greet` is a type-safe function expecting a `{ name: string }` object

console.log(greet({ name: "earth" }));
// "Hello earth!"
```

### Custom Interpolator

```tsx
import { Fragment, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { createInterpolator, tagSlots, slot } from "typed-template-slots";

// ## React JSX Interpolator

const interpolateJsx = createInterpolator({
  onMissingSlot(slotName) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(`Slot ${slotName} not found in values`);
    }

    return null;
  },
  text(text, index) {
    return <Fragment key={`text-${index}`}>{text}</Fragment>
  },
  slot(value: ReactNode, index) {
    return <Fragment key={`slot-${index}`}>{value}</Fragment>
  },
  compose(tokens) {
    return tokens;
  },
});

// ## Usage

const template = tagSlots`Hello ${slot("name")}!`;

function Greeting({ name }: { name: string }) {
  return <h1>{interpolateJsx(template, { name: <span>{name}</span> })}</h1>;
}

const result = renderToString(<Greeting name="World" />);

console.log(result);
// <h1>Hello <span>World</span>!</h1>
```

### i18n example

```ts
import { tagSlots, slot, interpolate } from "typed-template-slots";
  
type T10s = typeof en;
const en = {
  greeting: tagSlots`Hello ${slot("name")}!`,
};

const es = {
  greeting: tagSlots`Hola ${slot("name")}!`,
} satisfies T10s;

export function i18n(locale: 'en' | 'es') {
  return locale === 'en' ? en : es;
}

function greet(user: string, locale: 'en' | 'es') {
  const t = i18n(locale);
  return interpolate(t.greeting, { name: user });
}

console.log(greet("world", "en"));
// "Hello world!"
console.log(greet("world", "es"));
// "Hola world!"
```

