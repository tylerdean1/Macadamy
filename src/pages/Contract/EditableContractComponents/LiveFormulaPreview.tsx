import React from 'react';
import { evaluate } from 'mathjs';
import type { Variable } from '@/lib/formula.types';
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveFormulaPreviewProps {
  formula: string;
  variables: Variable[];
}

export const LiveFormulaPreview: React.FC<LiveFormulaPreviewProps> = ({
  formula,
  variables,
}) => {
  const { result, missing, isValid, unit } = React.useMemo(() => {
    if (!formula || variables.length === 0) {
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

    try {
      const evalResult = evaluate(formula, scope);
      const unitSet = new Set(variables.map((v) => v.unit).filter(Boolean));
      return {
        result: evalResult,
        missing,
        isValid: true,
        unit: unitSet.size === 1 ? [...unitSet][0] : null,
      };
    } catch {
      return {
        result: 'Invalid formula',
        missing,
        isValid: false,
        unit: null,
      };
    }
  }, [formula, variables]);

  return (
    <div
      className={`p-4 rounded mt-4 text-white ${
        isValid ? 'bg-gray-800' : 'border border-red-500'
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
          {unit ? ` ${unit}` : ''}
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
          {!isValid && result && (
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

      {!isValid && (
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
