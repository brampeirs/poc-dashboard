import { DistributionSlice, FixedCost, MonthNote, NetWorthPoint } from '../models/dashboard';

export const NET_WORTH_DATA: NetWorthPoint[] = [
  { month: '2024-12', label: '2024', value: 258000 },
  { month: '2025-01', label: '2025', value: 260000 },
  { month: '2025-02', label: '2025', value: 262000 },
  { month: '2025-03', label: '2025', value: 264000 },
  { month: '2025-04', label: '2025', value: 266000 },
  { month: '2025-05', label: '2025', value: 268000 },
  { month: '2025-06', label: '2025', value: 270000 },
  { month: '2025-07', label: '2025', value: 272000 },
  { month: '2025-08', label: '2025', value: 274000 },
  { month: '2025-09', label: '2025', value: 276000 },
  { month: '2025-10', label: '2025', value: 278000 },
  { month: '2025-11', label: '2025', value: 280000 }
];

export const MONTH_NOTES: MonthNote[] = [
  { month: '2025-01', note: 'Bonus ontvangen van werkgever' },
  { month: '2025-03', note: 'Auto reparatie (€2.500)' },
  { month: '2025-06', note: 'Vakantie naar Spanje' },
  { month: '2025-09', note: 'Nieuwe laptop gekocht' }
];

export const ACCOUNT_TYPE_DATA: DistributionSlice[] = [
  { name: 'Zicht', value: 15000 },
  { name: 'Spaar', value: 120000 },
  { name: 'Beleggingen', value: 150000 },
  { name: 'Cash', value: 12100 }
];

export const BANK_DISTRIBUTION_DATA: DistributionSlice[] = [
  { name: 'KBC', value: 85000 },
  { name: 'Belfius', value: 65000 },
  { name: 'ING', value: 42000 },
  { name: 'Argenta', value: 30000 }
];

export const INITIAL_FIXED_COSTS: FixedCost[] = [
  {
    name: 'Hypothecaire lening',
    amount: 1000,
    frequency: 'monthly',
    account: 'KBC Woning',
    kind: 'vast'
  },
  {
    name: 'Elektriciteit',
    amount: 160,
    frequency: 'monthly',
    account: 'DOMICILIËRING',
    kind: 'variabel'
  },
  {
    name: 'Water',
    amount: 120,
    frequency: 'yearly',
    account: 'Zichtrekening',
    kind: 'variabel'
  },
  {
    name: 'Internet / GSM',
    amount: 80,
    frequency: 'monthly',
    account: 'Zichtrekening',
    kind: 'vast'
  }
];
