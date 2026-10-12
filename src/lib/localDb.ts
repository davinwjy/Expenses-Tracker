import {
  User,
  Account,
  Transaction,
  Investment,
  UserSettings,
  DashboardStats,
} from '../types';

interface LocalDBSchema {
  users: Array<User & { passwordHash?: string }>;
  accounts: Account[];
  transactions: Transaction[];
  investments: Investment[];
  settings: UserSettings[];
}

const STORAGE_KEY = 'wealthtrack_local_db_v1';
const CURRENT_USER_KEY = 'wealthtrack_current_user_id';

const DEFAULT_RATE = 15850;

function getTodayStr(daysAgo = 0): string {
  const d = new Date();
  if (daysAgo > 0) {
    d.setDate(d.getDate() - daysAgo);
  }
  return d.toISOString().split('T')[0];
}

function createInitialData(): LocalDBSchema {
  const demoUserId = 'usr_demo_davin';
  const now = new Date().toISOString();

  const demoAccounts: Account[] = [
    {
      id: 'acc_demo_1',
      userId: demoUserId,
      name: 'BCA Main',
      type: 'bank',
      balance: 12500000,
      accountNumber: '•••• 4821',
      color: '#3b82f6',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'acc_demo_2',
      userId: demoUserId,
      name: 'Mandiri Payroll',
      type: 'bank',
      balance: 8000000,
      accountNumber: '•••• 9102',
      color: '#0284c7',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'acc_demo_3',
      userId: demoUserId,
      name: 'Physical Cash',
      type: 'cash',
      balance: 850000,
      color: '#10b981',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const demoInvestments: Investment[] = [
    {
      id: 'inv_demo_1',
      userId: demoUserId,
      name: 'BBCA (Bank Central Asia)',
      category: 'Saham',
      currency: 'IDR',
      amountInvested: 15000000,
      currentValue: 17200000,
      units: 17,
      platform: 'Ajaib / Sekuritas',
      notes: 'Blue chip banking stock',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inv_demo_2',
      userId: demoUserId,
      name: 'Sucorinvest Stable Fund',
      category: 'RDPU',
      currency: 'IDR',
      amountInvested: 10000000,
      currentValue: 10520000,
      platform: 'Bibit',
      notes: 'Low risk emergency fund asset',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inv_demo_3',
      userId: demoUserId,
      name: 'Bitcoin (BTC)',
      category: 'Bitcoin',
      currency: 'USD',
      amountInvested: 1200,
      currentValue: 1580,
      units: 0.0165,
      platform: 'Indodax / Cold Wallet',
      notes: 'Digital store of value',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inv_demo_4',
      userId: demoUserId,
      name: 'VOO - Vanguard S&P 500',
      category: 'ETF USA',
      currency: 'USD',
      amountInvested: 1500,
      currentValue: 1740,
      units: 3.2,
      platform: 'GoTrade / IBKR',
      notes: 'Broad market US index ETF',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inv_demo_5',
      userId: demoUserId,
      name: 'USD Savings / Cash',
      category: 'USD',
      currency: 'USD',
      amountInvested: 600,
      currentValue: 600,
      units: 600,
      platform: 'Wise / Multi-currency',
      notes: 'Foreign currency liquid buffer',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const demoTransactions: Transaction[] = [
    {
      id: 'tx_demo_1',
      userId: demoUserId,
      type: 'expense',
      amount: 85000,
      accountId: demoAccounts[0].id,
      category: 'Food & Dining',
      date: getTodayStr(0),
      notes: 'Lunch at Grand Indonesia',
      createdAt: now,
    },
    {
      id: 'tx_demo_2',
      userId: demoUserId,
      type: 'expense',
      amount: 150000,
      accountId: demoAccounts[0].id,
      category: 'Groceries',
      date: getTodayStr(1),
      notes: 'Weekly supermarket supplies',
      createdAt: now,
    },
    {
      id: 'tx_demo_3',
      userId: demoUserId,
      type: 'expense',
      amount: 45000,
      accountId: demoAccounts[2].id,
      category: 'Transportation',
      date: getTodayStr(2),
      notes: 'Taxi / Petrol',
      createdAt: now,
    },
    {
      id: 'tx_demo_4',
      userId: demoUserId,
      type: 'income',
      amount: 18500000,
      accountId: demoAccounts[1].id,
      category: 'Salary',
      date: getTodayStr(5),
      notes: 'Monthly engineering compensation',
      createdAt: now,
    },
    {
      id: 'tx_demo_5',
      userId: demoUserId,
      type: 'bank_to_investment',
      amount: 2500000,
      accountId: demoAccounts[0].id,
      toInvestmentId: demoInvestments[0].id,
      category: 'Investment Funding',
      date: getTodayStr(4),
      notes: 'Added to BBCA position',
      createdAt: now,
    },
    {
      id: 'tx_demo_6',
      userId: demoUserId,
      type: 'transfer',
      amount: 500000,
      accountId: demoAccounts[0].id,
      toAccountId: demoAccounts[2].id,
      category: 'ATM Cash Withdrawal',
      date: getTodayStr(3),
      notes: 'Bank ATM withdrawal to physical cash',
      createdAt: now,
    },
  ];

  return {
    users: [
      {
        id: demoUserId,
        email: 'davin@wealthtrack.app',
        name: 'Davin Wijaya',
        createdAt: now,
      },
    ],
    accounts: demoAccounts,
    transactions: demoTransactions,
    investments: demoInvestments,
    settings: [
      {
        userId: demoUserId,
        usdIdrRate: DEFAULT_RATE,
        privacyModeDefault: false,
        theme: 'dark',
      },
    ],
  };
}

function loadData(): LocalDBSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading from localStorage, resetting data:', e);
    const initial = createInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveData(data: LocalDBSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
}

export function getCurrentLocalUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentLocalUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export const localDb = {
  // Auth
  async register(email: string, _password: string, name?: string): Promise<{ token: string; user: User }> {
    const data = loadData();
    const cleanEmail = email.trim().toLowerCase();
    let existing = data.users.find(u => u.email === cleanEmail);

    if (existing) {
      // Allow re-login with same email in local mode
      setCurrentLocalUserId(existing.id);
      return { token: `local_token_${existing.id}`, user: existing };
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newUser: User = {
      id: userId,
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);

    // Create default accounts for new user
    const now = new Date().toISOString();
    const accounts: Account[] = [
      {
        id: 'acc_' + Date.now() + '_1',
        userId,
        name: 'BCA Main',
        type: 'bank',
        balance: 10000000,
        accountNumber: '•••• 1234',
        color: '#3b82f6',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'acc_' + Date.now() + '_2',
        userId,
        name: 'Physical Cash',
        type: 'cash',
        balance: 500000,
        color: '#10b981',
        createdAt: now,
        updatedAt: now,
      },
    ];
    data.accounts.push(...accounts);

    // Default setting
    data.settings.push({
      userId,
      usdIdrRate: DEFAULT_RATE,
      privacyModeDefault: false,
      theme: 'dark',
    });

    saveData(data);
    setCurrentLocalUserId(userId);
    return { token: `local_token_${userId}`, user: newUser };
  },

  async login(email: string, _password: string): Promise<{ token: string; user: User }> {
    const data = loadData();
    const cleanEmail = email.trim().toLowerCase();
    let user = data.users.find(u => u.email === cleanEmail);

    if (!user) {
      // Auto-create or return demo if matching demo
      return this.register(email, _password);
    }

    setCurrentLocalUserId(user.id);
    return { token: `local_token_${user.id}`, user };
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const userId = getCurrentLocalUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const data = loadData();
    const user = data.users.find(u => u.id === userId);
    if (!user) {
      // Fallback to first user
      if (data.users.length > 0) {
        setCurrentLocalUserId(data.users[0].id);
        return { user: data.users[0] };
      }
      throw new Error('User not found');
    }
    return { user };
  },

  // Accounts
  async getAccounts(): Promise<{ accounts: Account[] }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const accounts = data.accounts.filter(a => a.userId === userId);
    return { accounts };
  },

  async createAccount(input: {
    name: string;
    type: 'bank' | 'cash' | 'ewallet';
    balance: number;
    accountNumber?: string;
    color?: string;
  }): Promise<{ account: Account }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const now = new Date().toISOString();
    const account: Account = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      name: input.name.trim(),
      type: input.type,
      balance: Number(input.balance) || 0,
      accountNumber: input.accountNumber?.trim(),
      color: input.color || '#3b82f6',
      createdAt: now,
      updatedAt: now,
    };
    data.accounts.push(account);
    saveData(data);
    return { account };
  },

  async updateAccount(id: string, input: Partial<Account>): Promise<{ account: Account }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const account = data.accounts.find(a => a.id === id && a.userId === userId);
    if (!account) {
      throw new Error('Account not found');
    }
    if (input.name !== undefined) account.name = input.name.trim();
    if (input.type !== undefined) account.type = input.type;
    if (input.balance !== undefined) account.balance = Number(input.balance);
    if (input.accountNumber !== undefined) account.accountNumber = input.accountNumber.trim();
    if (input.color !== undefined) account.color = input.color;
    account.updatedAt = new Date().toISOString();
    saveData(data);
    return { account };
  },

  async deleteAccount(id: string): Promise<{ success: boolean }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const index = data.accounts.findIndex(a => a.id === id && a.userId === userId);
    if (index !== -1) {
      data.accounts.splice(index, 1);
      saveData(data);
    }
    return { success: true };
  },

  // Transactions
  async getTransactions(params?: { type?: string; accountId?: string; limit?: number }): Promise<{ transactions: Transaction[] }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    let txs = data.transactions.filter(t => t.userId === userId);

    if (params?.type) {
      txs = txs.filter(t => t.type === params.type);
    }
    if (params?.accountId) {
      txs = txs.filter(t => t.accountId === params.accountId || t.toAccountId === params.accountId);
    }

    txs.sort((a, b) => new Date(b.date + ' ' + b.createdAt).getTime() - new Date(a.date + ' ' + a.createdAt).getTime());

    if (params?.limit) {
      txs = txs.slice(0, params.limit);
    }

    return { transactions: txs };
  },

  async createTransaction(input: {
    type: 'expense' | 'income';
    amount: number;
    accountId: string;
    category: string;
    date: string;
    notes?: string;
  }): Promise<{ transaction: Transaction; updatedAccount: Account }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const account = data.accounts.find(a => a.id === input.accountId && a.userId === userId);
    if (!account) {
      throw new Error('Account not found');
    }

    const amt = Math.abs(Number(input.amount));
    if (input.type === 'expense') {
      account.balance -= amt;
    } else {
      account.balance += amt;
    }
    account.updatedAt = new Date().toISOString();

    const tx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      type: input.type,
      amount: amt,
      accountId: input.accountId,
      category: input.category,
      date: input.date || getTodayStr(),
      notes: input.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    data.transactions.unshift(tx);
    saveData(data);
    return { transaction: tx, updatedAccount: account };
  },

  async updateTransaction(id: string, input: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const tx = data.transactions.find(t => t.id === id && t.userId === userId);
    if (!tx) {
      throw new Error('Transaction not found');
    }
    if (input.notes !== undefined) tx.notes = input.notes.trim();
    if (input.category !== undefined) tx.category = input.category;
    if (input.date !== undefined) tx.date = input.date;
    saveData(data);
    return { transaction: tx };
  },

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const index = data.transactions.findIndex(t => t.id === id && t.userId === userId);
    if (index !== -1) {
      data.transactions.splice(index, 1);
      saveData(data);
    }
    return { success: true };
  },

  // Transfers
  async executeTransfer(input: {
    type: 'account_to_account' | 'bank_to_investment';
    fromAccountId: string;
    toAccountId?: string;
    toInvestmentId?: string;
    amountIdr: number;
    exchangeRate?: number;
    date?: string;
    notes?: string;
  }): Promise<{ success: boolean; transaction: Transaction }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const fromAcc = data.accounts.find(a => a.id === input.fromAccountId && a.userId === userId);
    if (!fromAcc) {
      throw new Error('Source account not found');
    }

    const amt = Math.abs(Number(input.amountIdr));
    fromAcc.balance -= amt;
    fromAcc.updatedAt = new Date().toISOString();

    let tx: Transaction;

    if (input.type === 'account_to_account') {
      const toAcc = data.accounts.find(a => a.id === input.toAccountId && a.userId === userId);
      if (!toAcc) {
        throw new Error('Destination account not found');
      }
      toAcc.balance += amt;
      toAcc.updatedAt = new Date().toISOString();

      tx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId,
        type: 'transfer',
        amount: amt,
        accountId: fromAcc.id,
        toAccountId: toAcc.id,
        category: 'Transfer',
        date: input.date || getTodayStr(),
        notes: input.notes?.trim() || `Transfer from ${fromAcc.name} to ${toAcc.name}`,
        createdAt: new Date().toISOString(),
      };
    } else {
      const inv = data.investments.find(i => i.id === input.toInvestmentId);
      const rate = input.exchangeRate || DEFAULT_RATE;
      let addedVal = amt;
      if (inv && inv.currency === 'USD') {
        addedVal = amt / rate;
      }
      if (inv) {
        inv.amountInvested += addedVal;
        inv.currentValue += addedVal;
        inv.updatedAt = new Date().toISOString();
      }

      tx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId,
        type: 'bank_to_investment',
        amount: amt,
        accountId: fromAcc.id,
        toInvestmentId: input.toInvestmentId,
        amountUsd: inv?.currency === 'USD' ? amt / rate : undefined,
        exchangeRate: rate,
        category: 'Investment Funding',
        date: input.date || getTodayStr(),
        notes: input.notes?.trim() || `Funded investment from ${fromAcc.name}`,
        createdAt: new Date().toISOString(),
      };
    }

    data.transactions.unshift(tx);
    saveData(data);
    return { success: true, transaction: tx };
  },

  // Investments
  async getInvestments(): Promise<{ investments: Investment[] }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const investments = data.investments.filter(i => i.userId === userId);
    return { investments };
  },

  async createInvestment(input: {
    name: string;
    category: 'USD' | 'Bitcoin' | 'Saham' | 'RDPU' | 'ETF USA';
    amountInvested: number;
    currentValue?: number;
    units?: number;
    platform?: string;
    notes?: string;
  }): Promise<{ investment: Investment }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const currency = (input.category === 'Saham' || input.category === 'RDPU') ? 'IDR' : 'USD';
    const invested = Number(input.amountInvested) || 0;
    const current = input.currentValue !== undefined ? Number(input.currentValue) : invested;
    const now = new Date().toISOString();

    const inv: Investment = {
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      name: input.name.trim(),
      category: input.category,
      currency,
      amountInvested: invested,
      currentValue: current,
      units: input.units !== undefined && input.units !== null ? Number(input.units) : undefined,
      platform: input.platform?.trim(),
      notes: input.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    data.investments.push(inv);
    saveData(data);
    return { investment: inv };
  },

  async updateInvestment(id: string, input: Partial<Investment>): Promise<{ investment: Investment }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const inv = data.investments.find(i => i.id === id && i.userId === userId);
    if (!inv) {
      throw new Error('Investment not found');
    }

    if (input.name !== undefined) inv.name = input.name.trim();
    if (input.category !== undefined) {
      inv.category = input.category;
      inv.currency = (input.category === 'Saham' || input.category === 'RDPU') ? 'IDR' : 'USD';
    }
    if (input.amountInvested !== undefined) inv.amountInvested = Number(input.amountInvested);
    if (input.currentValue !== undefined) inv.currentValue = Number(input.currentValue);
    if (input.units !== undefined) inv.units = input.units !== null ? Number(input.units) : undefined;
    if (input.platform !== undefined) inv.platform = input.platform.trim();
    if (input.notes !== undefined) inv.notes = input.notes.trim();
    inv.updatedAt = new Date().toISOString();

    saveData(data);
    return { investment: inv };
  },

  async deleteInvestment(id: string): Promise<{ success: boolean }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const index = data.investments.findIndex(i => i.id === id && i.userId === userId);
    if (index !== -1) {
      data.investments.splice(index, 1);
      saveData(data);
    }
    return { success: true };
  },

  // Settings
  async getSettings(): Promise<{ settings: UserSettings }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    let s = data.settings.find(setting => setting.userId === userId);
    if (!s) {
      s = {
        userId,
        usdIdrRate: DEFAULT_RATE,
        privacyModeDefault: false,
        theme: 'dark',
      };
      data.settings.push(s);
      saveData(data);
    }
    return { settings: s };
  },

  async updateSettings(input: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    let s = data.settings.find(setting => setting.userId === userId);
    if (!s) {
      s = {
        userId,
        usdIdrRate: DEFAULT_RATE,
        privacyModeDefault: false,
        theme: 'dark',
      };
      data.settings.push(s);
    }
    if (input.usdIdrRate !== undefined) s.usdIdrRate = Number(input.usdIdrRate);
    if (input.privacyModeDefault !== undefined) s.privacyModeDefault = input.privacyModeDefault;
    if (input.theme !== undefined) s.theme = input.theme;
    saveData(data);
    return { settings: s };
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const userId = getCurrentLocalUserId() || 'usr_demo_davin';
    const data = loadData();
    const settings = data.settings.find(s => s.userId === userId);
    const rate = settings?.usdIdrRate || DEFAULT_RATE;

    const userAccounts = data.accounts.filter(a => a.userId === userId);
    const userInvestments = data.investments.filter(i => i.userId === userId);
    const userTransactions = data.transactions.filter(t => t.userId === userId);

    const totalLiquidCashIdr = userAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    let totalInvestedCostIdr = 0;
    let totalInvestmentValueIdr = 0;
    let totalInvestmentValueUsd = 0;

    const categoryAllocations: Record<string, { idrValue: number; usdValue: number; count: number }> = {
      'Saham': { idrValue: 0, usdValue: 0, count: 0 },
      'RDPU': { idrValue: 0, usdValue: 0, count: 0 },
      'Bitcoin': { idrValue: 0, usdValue: 0, count: 0 },
      'ETF USA': { idrValue: 0, usdValue: 0, count: 0 },
      'USD': { idrValue: 0, usdValue: 0, count: 0 },
    };

    userInvestments.forEach(inv => {
      let valIdr = 0;
      let valUsd = 0;
      let costIdr = 0;

      if (inv.currency === 'USD') {
        valUsd = inv.currentValue || 0;
        valIdr = valUsd * rate;
        costIdr = (inv.amountInvested || 0) * rate;
        totalInvestmentValueUsd += valUsd;
      } else {
        valIdr = inv.currentValue || 0;
        valUsd = valIdr / rate;
        costIdr = inv.amountInvested || 0;
      }

      totalInvestedCostIdr += costIdr;
      totalInvestmentValueIdr += valIdr;

      if (categoryAllocations[inv.category]) {
        categoryAllocations[inv.category].idrValue += valIdr;
        categoryAllocations[inv.category].usdValue += valUsd;
        categoryAllocations[inv.category].count += 1;
      }
    });

    const totalNetWorthIdr = totalLiquidCashIdr + totalInvestmentValueIdr;

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTxs = userTransactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix));

    const monthlyExpenses = thisMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncomes = thisMonthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyTransfersToInv = thisMonthTxs
      .filter(t => t.type === 'bank_to_investment')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseByCategory: Record<string, number> = {};
    thisMonthTxs
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
      });

    const expenseByAccount: Record<string, { name: string; amount: number; type: string }> = {};
    thisMonthTxs
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const acc = userAccounts.find(a => a.id === t.accountId);
        const accName = acc ? acc.name : 'Unknown Account';
        const accType = acc ? acc.type : 'bank';
        if (!expenseByAccount[t.accountId]) {
          expenseByAccount[t.accountId] = { name: accName, amount: 0, type: accType };
        }
        expenseByAccount[t.accountId].amount += t.amount;
      });

    const unrealizedPnlIdr = totalInvestmentValueIdr - totalInvestedCostIdr;
    const unrealizedPnlPercentage = totalInvestedCostIdr > 0 ? (unrealizedPnlIdr / totalInvestedCostIdr) * 100 : 0;

    return {
      rate,
      totalNetWorthIdr,
      totalLiquidCashIdr,
      totalInvestmentValueIdr,
      totalInvestmentValueUsd,
      totalInvestedCostIdr,
      unrealizedPnlIdr,
      unrealizedPnlPercentage,
      monthlyExpenses,
      monthlyIncomes,
      monthlyTransfersToInv,
      categoryAllocations,
      expenseByCategory,
      expenseByAccount,
    };
  },
};
