export type AccountType = 'bank' | 'cash' | 'ewallet';
export type InvestmentCategory = 'USD' | 'Bitcoin' | 'Saham' | 'RDPU' | 'ETF USA';
export type Currency = 'IDR' | 'USD';
export type TransactionType = 'expense' | 'income' | 'transfer' | 'bank_to_investment';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number; // in IDR
  accountNumber?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // in IDR
  accountId: string; // source account
  toAccountId?: string; // for transfer
  toInvestmentId?: string; // for bank_to_investment
  amountUsd?: number; // for USD investments
  exchangeRate?: number;
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  category: InvestmentCategory;
  currency: Currency;
  amountInvested: number; // Cost basis in asset currency
  currentValue: number; // Current value in asset currency
  units?: number; // e.g. shares, lots, crypto amount
  platform?: string; // e.g. GoTrade, Bibit, Ajaib, Indodax
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  usdIdrRate: number;
  privacyModeDefault: boolean;
  theme: 'dark' | 'light';
}

export interface DashboardStats {
  rate: number;
  totalNetWorthIdr: number;
  totalLiquidCashIdr: number;
  totalInvestmentValueIdr: number;
  totalInvestmentValueUsd: number;
  totalInvestedCostIdr: number;
  unrealizedPnlIdr: number;
  unrealizedPnlPercentage: number;
  monthlyExpenses: number;
  monthlyIncomes: number;
  monthlyTransfersToInv: number;
  categoryAllocations: Record<string, { idrValue: number; usdValue: number; count: number }>;
  expenseByCategory: Record<string, number>;
  expenseByAccount: Record<string, { name: string; amount: number; type: string }>;
}
