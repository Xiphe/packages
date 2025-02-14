import { ExpectColorOptions } from "../src/config.js";
import { Color } from "../src/lib/isSameColor.js";

declare namespace matchers {
  interface ColorMatchers {
    /**
     * @description
     * Check if a color equals another color.
     * Converting actual color into the color-space of expected color.
     *
     * @example
     * expect('cmyk(0, 100, 100, 0)').toEqualColor('red');
     */
    toEqualColor(color: string | Color, options?: ExpectColorOptions): void;
    /**
     * @description
     * Check if a color is the same then expected color in the same color-space.
     *
     * @example
     * expect('rgb(255, 0, 0)').toEqualColor('red');
     */
    toBeColor(color: string | Color): void;
  }
}

// Needs to extend Record<string, any> to be accepted by expect.extend()
// as it requires a string index signature.
declare const matchers: matchers.ColorMatchers & Record<string, any>;

export = matchers;
