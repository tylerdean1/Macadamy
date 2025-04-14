/**
 * Utility functions for formatting data.
 */

/** 
 * Formats a number as currency with a dollar sign and 2 decimal places.
 *
 * @param amount - The numerical amount to format as currency.
 * @returns A string representing the formatted currency value.
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`; // Convert number to a string formatted with a dollar sign and two decimal places.
};