import { Template } from "../src/lib/compareTemplate.ts";

export interface TemplateMatchers<R> {
  /**
   * @description
   * Check if a string matches a template.
   *
   * @example
   * expect('rgb(255, 0, 0)').toEqualTemplate('rgb(255, 0, 0)');
   */
  toMatchTemplate(template: Template): R;
}

export default TemplateMatchers;
