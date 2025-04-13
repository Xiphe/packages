export type TemplatePart =
  | string
  | {
      s: string;
    };

export type Slots<T extends string> = Array<{ __slot: T } | string>;

export type ExtractSlotNames<T extends Slots<string>> = T extends Array<infer U>
  ? U extends { __slot: infer S }
    ? S extends string
      ? S
      : never
    : never
  : never;

export type Template<SlotNames extends string = string> = TemplatePart[] & {
  "#": SlotNames;
};

/**
 * Create a slot marker for template interpolation
 */
export function slot<T extends string>(name: T): { __slot: T } {
  return { __slot: name };
}

/**
 * Create a template with slots from a tagged template literal
 */
export function tagSlots<Values extends Slots<string>>(
  strings: TemplateStringsArray,
  ...values: Values
) {
  const parts: TemplatePart[] = [];

  strings.forEach((str, i) => {
    if (str) {
      parts.push(str);
    }

    if (i < values.length) {
      const value = values[i];

      if (typeof value === "object" && "__slot" in value) {
        parts.push({ s: value.__slot });
      } else if (typeof value === "string") {
        parts.push(value);
      } else {
        throw new Error("Invalid value type");
      }
    }
  });

  return parts as Template<ExtractSlotNames<Values>>;
}

export interface InterpolateOptions<SlotValue, Token, Final> {
  /** Handle missing slots during runtime */
  onMissingSlot: (slotName: string, index: number) => Token;
  /** Handle text parts */
  text: (text: string, index: number) => Token;
  /** Handle slot parts */
  slot: (value: SlotValue, index: number, slotName: string) => Token;
  /** Compose the tokens into a final result */
  compose: (tokens: Token[]) => Final;
}

/**
 * Create a custom interpolator function with specific token handling
 */
export function createInterpolator<SlotValue, Token, Final>({
  text,
  slot,
  compose,
  onMissingSlot,
}: InterpolateOptions<SlotValue, Token, Final>) {
  function interpolate<T extends string>(
    template: Template<T>,
  ): (values: Record<T, SlotValue>) => Final;
  function interpolate<T extends string>(
    template: Template<T>,
    values: Record<T, SlotValue>,
  ): Final;
  function interpolate<T extends string>(
    template: Template<T>,
    values?: Record<T, SlotValue>,
  ): Final | ((values: Record<T, SlotValue>) => Final) {
    const run = (values: Record<T, SlotValue>) => {
      const tokens = template.map((part, i) => {
        if (typeof part === "string") {
          return text(part, i);
        }

        if (part.s in values) {
          return slot(values[part.s as T], i, part.s);
        }

        return onMissingSlot(part.s, i);
      });

      return compose(tokens);
    };

    if (values != null) {
      return run(values);
    }

    return run;
  }

  return interpolate;
}

export const interpolate = /*#__PURE__*/ createInterpolator({
  onMissingSlot(slotName) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Slot ${slotName} not found in values`);
    }

    return "";
  },
  text(text) {
    return text;
  },
  slot(value: string | number) {
    return String(value);
  },
  compose(tokens) {
    return tokens.join("");
  },
});
