/**
 * Formats a number as currency with dollar sign and 2 decimal places
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
