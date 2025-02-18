/// <reference types="jest" />

import { type TemplateMatchers } from "./matchers.js";

declare global {
  namespace jest {
    interface Matchers extends TemplateMatchers {}
  }
}
