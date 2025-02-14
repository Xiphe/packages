/// <reference types="jest" />

import { type ColorMatchers } from "./matchers.js";

declare global {
  namespace jest {
    interface Matchers extends ColorMatchers {}
  }
}
