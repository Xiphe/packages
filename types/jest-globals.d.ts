import { type expect } from "@jest/globals";
import { type ColorMatchers } from "./matchers.js";

export {};
declare module "@jest/expect" {
  export interface Matchers extends ColorMatchers {}
}
