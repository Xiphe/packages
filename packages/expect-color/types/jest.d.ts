/// <reference types="jest" />

import "match-template/jest";
import { type ColorMatchers } from "./matchers.js";

declare global {
  namespace jest {
    interface Matchers extends ColorMatchers {}
  }
}
