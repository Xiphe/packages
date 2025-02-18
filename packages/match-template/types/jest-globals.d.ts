import { type expect } from "@jest/globals";
import { type TemplateMatchers } from "./matchers.js";

export {};
declare module "@jest/expect" {
  export interface Matchers extends Matchers {}
}
