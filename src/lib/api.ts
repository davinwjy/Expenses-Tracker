import {
  User,
  Account,
  Transaction,
  Investment,
  UserSettings,
  DashboardStats,
} from '../types';
import { localDb, getCurrentLocalUserId, setCurrentLocalUserId } from './localDb';

const TOKEN_KEY = 'wealthtrack_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  setCurrentLocalUserId(null);
}

// Configurable API URL for remote deployment (e.g. Render, Railway, Cloud Run)
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Detect whether we are running on GitHub Pages or a static host without an active backend
function isStaticEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  // If explicitly configured with a custom API URL, don't force static
  if (API_BASE_URL) return false;
  // GitHub Pages domain
  if (window.location.hostname.endsWith('github.io')) return true;
  // File protocol
  if (window.location.protocol === 'file:') return true;
  return false;
}

let backendAvailable: boolean | null = isStaticEnvironment() ? false : null;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Check if the response is HTML (which happens when 404 returns index.html or GitHub Pages 404)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      backendAvailable = false;
      throw new Error(`Endpoint returned HTML instead of JSON: ${endpoint}`);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 404 && !API_BASE_URL) {
        backendAvailable = false;
      }
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    backendAvailable = true;
    return data as T;
  } catch (err: any) {
    // If backend is unreachable or returned 404, mark backend as unavailable
    if (backendAvailable !== true) {
      backendAvailable = false;
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(email: string, password: string, name?: string): Promise<{ token: string; user: User }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      const res = await localDb.register(email, password, name);
      setAuthToken(res.token);
      return res;
    }
    try {
      const res = await request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      setAuthToken(res.token);
      return res;
    } catch {
      // Graceful fallback to client storage on GitHub Pages / static
      const res = await localDb.register(email, password, name);
      setAuthToken(res.token);
      return res;
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      const res = await localDb.login(email, password);
      setAuthToken(res.token);
      return res;
    }
    try {
      const res = await request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(res.token);
      return res;
    } catch {
      // Fallback to localDb
      const res = await localDb.login(email, password);
      setAuthToken(res.token);
      return res;
    }
  },

  async getCurrentUser(): Promise<{ user: User }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.getCurrentUser();
    }
    try {
      return await request<{ user: User }>('/api/auth/me');
    } catch {
      return localDb.getCurrentUser();
    }
  },

  // Accounts
  async getAccounts(): Promise<{ accounts: Account[] }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.getAccounts();
    }
    try {
      return await request<{ accounts: Account[] }>('/api/accounts');
    } catch {
      return localDb.getAccounts();
    }
  },

  async createAccount(data: {
    name: string;
    type: 'bank' | 'cash' | 'ewallet';
    balance: number;
    accountNumber?: string;
    color?: string;
  }): Promise<{ account: Account }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.createAccount(data);
    }
    try {
      return await request<{ account: Account }>('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.createAccount(data);
    }
  },

  async updateAccount(id: string, data: Partial<Account>): Promise<{ account: Account }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.updateAccount(id, data);
    }
    try {
      return await request<{ account: Account }>(`/api/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.updateAccount(id, data);
    }
  },

  async deleteAccount(id: string): Promise<{ success: boolean }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.deleteAccount(id);
    }
    try {
      return await request<{ success: boolean }>(`/api/accounts/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return localDb.deleteAccount(id);
    }
  },

  // Transactions
  async getTransactions(params?: { type?: string; accountId?: string; limit?: number }): Promise<{ transactions: Transaction[] }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.getTransactions(params);
    }
    try {
      const query = new URLSearchParams();
      if (params?.type) query.append('type', params.type);
      if (params?.accountId) query.append('accountId', params.accountId);
      if (params?.limit) query.append('limit', String(params.limit));

      const qs = query.toString() ? `?${query.toString()}` : '';
      return await request<{ transactions: Transaction[] }>(`/api/transactions${qs}`);
    } catch {
      return localDb.getTransactions(params);
    }
  },

  async createTransaction(data: {
    type: 'expense' | 'income';
    amount: number;
    accountId: string;
    category: string;
    date: string;
    notes?: string;
  }): Promise<{ transaction: Transaction; updatedAccount: Account }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.createTransaction(data);
    }
    try {
      return await request<{ transaction: Transaction; updatedAccount: Account }>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.createTransaction(data);
    }
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.updateTransaction(id, data);
    }
    try {
      return await request<{ transaction: Transaction }>(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.updateTransaction(id, data);
    }
  },

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.deleteTransaction(id);
    }
    try {
      return await request<{ success: boolean }>(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return localDb.deleteTransaction(id);
    }
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
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.executeTransfer(data);
    }
    try {
      return await request<{ success: boolean; transaction: Transaction }>('/api/transfers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.executeTransfer(data);
    }
  },

  // Investments
  async getInvestments(): Promise<{ investments: Investment[] }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.getInvestments();
    }
    try {
      return await request<{ investments: Investment[] }>('/api/investments');
    } catch {
      return localDb.getInvestments();
    }
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
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.createInvestment(data);
    }
    try {
      return await request<{ investment: Investment }>('/api/investments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.createInvestment(data);
    }
  },

  async updateInvestment(id: string, data: Partial<Investment>): Promise<{ investment: Investment }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.updateInvestment(id, data);
    }
    try {
      return await request<{ investment: Investment }>(`/api/investments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.updateInvestment(id, data);
    }
  },

  async deleteInvestment(id: string): Promise<{ success: boolean }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.deleteInvestment(id);
    }
    try {
      return await request<{ success: boolean }>(`/api/investments/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return localDb.deleteInvestment(id);
    }
  },

  // Settings
  async getSettings(): Promise<{ settings: UserSettings }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.getSettings();
    }
    try {
      return await request<{ settings: UserSettings }>('/api/settings');
    } catch {
      return localDb.getSettings();
    }
  },

  async updateSettings(data: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.updateSettings(data);
    }
    try {
      return await request<{ settings: UserSettings }>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localDb.updateSettings(data);
    }
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (backendAvailable === false || isStaticEnvironment()) {
      return localDb.getDashboardStats();
    }
    try {
      return await request<DashboardStats>('/api/stats/dashboard');
    } catch {
      return localDb.getDashboardStats();
    }
  },
};
