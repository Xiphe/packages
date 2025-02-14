/// <reference types="jest" />

import { type ColorMatchers } from "./matchers";

declare global {
  namespace jest {
    interface Matchers extends ColorMatchers {}
  }
}
