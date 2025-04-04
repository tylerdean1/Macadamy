// Utility functions for contract calculations

export function calculateContractTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function calculateAmountPaid(quantityToDate: number, unitPrice: number): number {
  return quantityToDate * unitPrice;
}

export function calculateProgress(amountPaid: number, contractTotal: number): number {
  if (contractTotal === 0) return 0;
  return Math.round((amountPaid / contractTotal) * 100);
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

export function processLineItem(item: LineItem) {
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