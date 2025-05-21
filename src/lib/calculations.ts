// Utility functions for contract calculations

/**
 * Calculate the total contract amount.
 *
 * @param {number} quantity - The quantity of items.
 * @param {number} unitPrice - The price per unit.
 * @returns {number} - The total contract amount.
 */
export function calculateContractTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * Calculate the amount paid to date.
 *
 * @param {number} quantityToDate - The total quantity paid to date.
 * @param {number} unitPrice - The price per unit.
 * @returns {number} - The total amount paid to date.
 */
export function calculateAmountPaid(quantityToDate: number, unitPrice: number): number {
  return quantityToDate * unitPrice;
}

/**
 * Calculate the progress percentage based on amount paid and contract total.
 *
 * @param {number} amountPaid - The total amount paid.
 * @param {number} contractTotal - The total contract amount.
 * @returns {number} - The progress percentage, capped at 100%.
 */
export function calculateProgress(amountPaid: number, contractTotal: number): number {
  if (contractTotal === 0) return 0; // Avoid division by zero.
  return Math.min(Math.round((amountPaid / contractTotal) * 100), 100);
}

export interface LineItem {
  lineCode: string;
  description: string;
  wbs: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  reference: string;
  quantityToDate: number;
}

/**
 * Process a line item to add calculated fields.
 *
 * @param {LineItem} item - The line item to process.
 * @returns {LineItem & { contractTotal: number; amountPaid: number; progress: number; }} - The processed line item with additional calculations.
 */
export function processLineItem(item: LineItem): LineItem & { contractTotal: number; amountPaid: number; progress: number; } {
  const contractTotal = calculateContractTotal(item.quantity, item.unitPrice);
  const amountPaid = calculateAmountPaid(item.quantityToDate, item.unitPrice);
  const progress = calculateProgress(amountPaid, contractTotal);

  return {
    ...item,
    contractTotal,
    amountPaid,
    progress
  };
}
