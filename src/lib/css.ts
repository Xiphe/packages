import { Template } from "./compareTemplate.js";

export function css(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Template {
  return {
    strings,
    values,
    normalize: (str: string) => str.replace(/\s+/g, " ").trim(),
    matchValue: (part: string) => {
      // Match any of these CSS value patterns:
      // 1. Functions like rgb(), url(), calc() - handles nested parentheses
      // 2. Quoted strings - both single and double quotes
      // 3. Numbers with units - like 12px, 1.5em, -2rem
      // 4. Keywords and hex colors - any sequence of characters until whitespace or semicolon
      return part.match(
        /^(?:(?:[a-z-]+\([^()]*(?:\([^()]*\)[^()]*)*\))|(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?:-?\d*\.?\d+[a-z%]*)|(?:[^;\s]+))/i,
      );
    },
  };
}
