export interface Estimate {
  id: string;
  externalId: string;
  contractId: string;
  title: string;
  amount: number;
  status: string | null;
}
