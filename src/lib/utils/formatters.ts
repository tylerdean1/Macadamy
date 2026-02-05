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

/**
 * Formats a phone number as (XXX) XXX-XXXX.
 */
export const formatPhoneUS = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};