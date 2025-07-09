import React from 'react';
import { evaluate } from 'mathjs';
import type { CalculatorTemplate } from '@/lib/formula.types';
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveFormulaPreviewProps {
  calculator: CalculatorTemplate;
}

export const LiveFormulaPreview: React.FC<LiveFormulaPreviewProps> = ({
  calculator,
}) => {
  const formula = calculator.formula?.expression ?? '';
  const variables = calculator.variables;

  const { result, missing, isValid, unit } = React.useMemo<{
    result: number | null;
    missing: string[];
    isValid: boolean;
    unit: string | null;
  }>(
    () => {
      if (!formula || !Array.isArray(variables) || variables.length === 0) {
        return {
          result: null,
          missing: [],
          isValid: false,
          unit: null,
        };
      }

      const scope: Record<string, number> = {};
      const missing: string[] = [];

      for (const v of variables) {
        if (v.name && v.value !== undefined && v.value !== '') {
          const parsed = parseFloat(String(v.value));
          if (!isNaN(parsed)) {
            scope[v.name] = parsed;
          } else {
            missing.push(v.name);
          }
        } else {
          missing.push(v.name);
        }
      }

      // Add type assertion for evaluate to avoid unsafe assignment
      const evaluated = evaluate(formula, scope) as unknown;
      // For evalResult, add a type guard to ensure it is a number or null
      let evalResult: number | null = null;
      if (typeof evaluated === 'number' && !Number.isNaN(evaluated)) {
        evalResult = evaluated;
      } else {
        evalResult = null;
      }

      const unitSet = new Set(variables.map((v) => v.unit).filter(Boolean));
      const foundUnit = unitSet.size === 1 ? [...unitSet][0] : null;
      return {
        result: typeof evalResult === 'number' ? evalResult : null,
        missing,
        isValid: true,
        unit: typeof foundUnit === 'string' ? foundUnit : null,
      };
    },
    [formula, variables]
  );

  return (
    <div
      className={`p-4 rounded mt-4 text-white ${isValid ? 'bg-gray-800' : 'border border-red-500'
        }`}
    >
      <h3 className="font-semibold mb-2 text-lg">Live Formula Result</h3>

      {missing.length > 0 && (
        <p className="text-yellow-400 mb-2">
          Missing values for: <strong>{missing.join(', ')}</strong>
        </p>
      )}

      <div className="flex items-center gap-2 text-xl">
        <pre className={isValid ? 'text-primary' : 'text-red-400'}>
          {result !== null ? result : 'No output yet'}
          {typeof unit === 'string' && unit.trim() !== '' ? ` ${unit}` : ''}
        </pre>

        <AnimatePresence>
          {isValid && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle className="text-green-400 w-5 h-5" />
            </motion.div>
          )}
          {!isValid && typeof result === 'number' && !Number.isNaN(result) && result !== 0 && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <XCircle className="text-red-400 w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isValid && result !== null && typeof result === 'number' && !Number.isNaN(result) && (
        <button
          className="mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
          onClick={() => console.log('Re-evaluating...')}
        >
          <RefreshCcw className="w-4 h-4" />
          Recalculate
        </button>
      )}
    </div>
  );
};
