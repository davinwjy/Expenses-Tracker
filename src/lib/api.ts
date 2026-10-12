import {
  User,
  Account,
  Transaction,
  Investment,
  UserSettings,
  DashboardStats,
} from '../types';

const TOKEN_KEY = 'wealthtrack_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(email: string, password: string, name?: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setAuthToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  // Accounts
  async getAccounts(): Promise<{ accounts: Account[] }> {
    return request<{ accounts: Account[] }>('/api/accounts');
  },

  async createAccount(data: {
    name: string;
    type: 'bank' | 'cash' | 'ewallet';
    balance: number;
    accountNumber?: string;
    color?: string;
  }): Promise<{ account: Account }> {
    return request<{ account: Account }>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAccount(id: string, data: Partial<Account>): Promise<{ account: Account }> {
    return request<{ account: Account }>(`/api/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
  },

  // Transactions
  async getTransactions(params?: { type?: string; accountId?: string; limit?: number }): Promise<{ transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.accountId) query.append('accountId', params.accountId);
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ transactions: Transaction[] }>(`/api/transactions${qs}`);
  },

  async createTransaction(data: {
    type: 'expense' | 'income';
    amount: number;
    accountId: string;
    category: string;
    date: string;
    notes?: string;
  }): Promise<{ transaction: Transaction; updatedAccount: Account }> {
    return request<{ transaction: Transaction; updatedAccount: Account }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    return request<{ transaction: Transaction }>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Transfers
  async executeTransfer(data: {
    type: 'account_to_account' | 'bank_to_investment';
    fromAccountId: string;
    toAccountId?: string;
    toInvestmentId?: string;
    amountIdr: number;
    exchangeRate?: number;
    date?: string;
    notes?: string;
  }): Promise<{ success: boolean; transaction: Transaction }> {
    return request<{ success: boolean; transaction: Transaction }>('/api/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Investments
  async getInvestments(): Promise<{ investments: Investment[] }> {
    return request<{ investments: Investment[] }>('/api/investments');
  },

  async createInvestment(data: {
    name: string;
    category: 'USD' | 'Bitcoin' | 'Saham' | 'RDPU' | 'ETF USA';
    amountInvested: number;
    currentValue?: number;
    units?: number;
    platform?: string;
    notes?: string;
  }): Promise<{ investment: Investment }> {
    return request<{ investment: Investment }>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateInvestment(id: string, data: Partial<Investment>): Promise<{ investment: Investment }> {
    return request<{ investment: Investment }>(`/api/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteInvestment(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/investments/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  async getSettings(): Promise<{ settings: UserSettings }> {
    return request<{ settings: UserSettings }>('/api/settings');
  },

  async updateSettings(data: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
    return request<{ settings: UserSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/stats/dashboard');
  },
};
