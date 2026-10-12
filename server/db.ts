import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'wealthtrack.json');

export type AccountType = 'bank' | 'cash' | 'ewallet';
export type InvestmentCategory = 'USD' | 'Bitcoin' | 'Saham' | 'RDPU' | 'ETF USA';
export type Currency = 'IDR' | 'USD';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
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
  type: 'expense' | 'income' | 'transfer' | 'bank_to_investment';
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
  amountInvested: number; // Cost basis in asset currency (IDR for Saham/RDPU, USD for USD/Bitcoin/ETF USA)
  currentValue: number; // Current value in asset currency
  units?: number; // e.g. shares, lots, crypto amount
  platform?: string; // e.g. GoTrade, Bibit, Ajaib, Indodax, etc.
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  usdIdrRate: number; // e.g. 15850
  privacyModeDefault: boolean;
  theme: 'dark' | 'light';
}

export interface DatabaseSchema {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  investments: Investment[];
  settings: UserSettings[];
}

// In-memory cache synced with JSON file
let dbData: DatabaseSchema = {
  users: [],
  accounts: [],
  transactions: [],
  investments: [],
  settings: [],
};

// Initialize data directory and file
export function initDB(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      dbData = JSON.parse(raw);
    } catch (e) {
      console.error('Error reading db file, re-initializing:', e);
      persistDB();
    }
  } else {
    persistDB();
  }
}

export function persistDB(): void {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

export const db = {
  get data() {
    return dbData;
  },
  save() {
    persistDB();
  },
};
