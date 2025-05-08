export interface Variable {
    name: string;
    label: string;
    type: 'number' | 'string' | 'boolean'; // Extend as needed
    unit?: string;
    defaultValue?: number;
    value?: string | number;
  }
  
  export interface Formula {
    name: string;
    expression: string; // mathjs-compatible
    description?: string;
    outputUnit?: string;
  }
  
  export interface CalculatorTemplate {
    id: string;
    name: string;
    description?: string;
    line_code?: string;
    variables: Variable[];
    formulas: Formula[];
  }
  