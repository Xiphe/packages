/// <reference types="jest" />

import { type ColorMatchers } from "./matchers/index.js";

declare global {
  namespace jest {
    interface Matchers extends ColorMatchers {}
  }
}
