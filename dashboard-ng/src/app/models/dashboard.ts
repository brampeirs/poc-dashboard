export type Range = 'all' | 'ytd' | '1y' | '6m';

export interface NetWorthPoint {
  month: string;
  label: string;
  value: number;
}

export interface MonthNote {
  month: string;
  note: string;
}

export interface FixedCost {
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  account?: string;
  kind: 'vast' | 'variabel';
}

export interface DistributionSlice {
  name: string;
  value: number;
}
