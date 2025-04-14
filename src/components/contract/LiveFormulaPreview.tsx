import React from 'react'; // Import React library
import { evaluate } from 'mathjs'; // Import mathjs for evaluating formulas
import type { Variable } from '@/types'; // Import type for Variable
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react'; // Import icons for status indicators
import { motion, AnimatePresence } from 'framer-motion'; // Import for animations

// Define props for LiveFormulaPreview component
interface LiveFormulaPreviewProps {
  formula: string; // Formula to evaluate
  variables: Variable[]; // Array of variables used in the formula
}

// LiveFormulaPreview component for live evaluation of a formula
export const LiveFormulaPreview: React.FC<LiveFormulaPreviewProps> = ({
  formula, // Formula provided as a prop
  variables // Variables provided as an array
}) => {
  const { result, missing, isValid, unit } = React.useMemo(() => {
    // Memoized calculation to avoid unnecessary re-evaluations
    if (!formula || variables.length === 0) {
      return {
        result: null,
        missing: [],
        isValid: false,
        unit: null,
      };
    }

    const scope: Record<string, number> = {}; // Dictionary to hold variable names and values
    const missing: string[] = []; // Array to track missing variable values

    for (const v of variables) {
      // Loop through variables to populate the scope
      if (v.name && v.value !== undefined && v.value !== '') {
        const parsed = parseFloat(String(v.value)); // Parse value to number
        if (!isNaN(parsed)) {
          scope[v.name] = parsed; // Add valid variable to scope
        } else {
          missing.push(v.name); // Track missing variable if parsing fails
        }
      } else {
        missing.push(v.name); // Track missing variable
      }
    }

    try {
      const result = evaluate(formula, scope); // Evaluate the formula with the provided scope
      const unitSet = new Set(variables.map((v) => v.unit).filter(Boolean)); // Get unique units
      return {
        result,
        missing,
        isValid: true, // Mark as valid if evaluation succeeded
        unit: unitSet.size === 1 ? [...unitSet][0] : null // Determine unit for the result
      };
    } catch {
      return {
        result: 'Invalid formula', // Handle invalid formula
        missing,
        isValid: false, // Mark as invalid
        unit: null
      };
    }
  }, [formula, variables]); // Dependencies for re-evaluation

  return (
    <div className={`p-4 rounded mt-4 text-white ${isValid ? 'bg-gray-800' : 'border border-red-500'}`}>
      <h3 className="font-semibold mb-2 text-lg">Live Formula Result</h3>

      {missing.length > 0 && (
        <p className="text-yellow-400 mb-2">
          Missing values for: <strong>{missing.join(', ')}</strong> {/* Display any missing variables */}
        </p>
      )}

      <div className="flex items-center gap-2 text-xl">
        <pre className={isValid ? 'text-primary' : 'text-red-400'}>
          {result !== null ? result : 'No output yet'}
          {unit ? ` ${unit}` : ''} {/* Display unit if available */}
        </pre>

        <AnimatePresence>
          {/* Animate success or failure icon based on evaluation result */}
          {isValid && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle className="text-green-400 w-5 h-5" /> {/* Success icon */}
            </motion.div>
          )}
          {!isValid && result && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <XCircle className="text-red-400 w-5 h-5" /> {/* Error icon */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isValid && (
        <button
          className="mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
          onClick={() => console.log('Re-evaluating...')} // Placeholder for re-evaluation logic
        >
          <RefreshCcw className="w-4 h-4" /> {/* Refresh icon */}
          Recalculate {/* Button label */}
        </button>
      )}
    </div>
  );
};