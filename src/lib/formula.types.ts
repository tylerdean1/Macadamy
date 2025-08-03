import { Database } from "./database.types";

export interface Variable {
  name: string;
  type: 'input' | 'output' | 'constant';
  unit?: Database["public"]["Enums"]["unit_measure"] | null;
  defaultValue?: number;
  value?: string | number;
}

export interface Formula {
  name: string;
  /**
   * A mathjs-compatible expression using variable names and math operators.
   * Example: "area = height * width"
   * 
   * UI: Show variable name, type, unit, and value for user selection and display.
   * Code: Only use variable names and their values in the expression for calculation.
   */
  expression: string;
  description?: string | null;
}

export interface CalculatorTemplate {
  id: string;
  name: string;
  description?: string | null;
  line_code?: string; // (optional, legacy support only)
  item_code?: string; // Use this for new code
  variables: Variable[];
  formula: Formula;
}
