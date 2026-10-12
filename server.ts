import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  initDB,
  db,
  User,
  Account,
  Transaction,
  Investment,
  UserSettings,
} from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'wealthtrack-secret-key-prod-2026';
const isProduction = process.env.NODE_ENV === 'production';

// Initialize persistent JSON database
initDB();

const app = express();
app.use(cors());
app.use(express.json());

// Extend express Request for user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Authentication middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Helper to get exchange rate for user
function getUserRate(userId: string): number {
  const userSetting = db.data.settings.find(s => s.userId === userId);
  return userSetting ? userSetting.usdIdrRate : 15850;
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response): void => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.data.users.find(u => u.email === cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newUser: User = {
      id: userId,
      email: cleanEmail,
      passwordHash,
      name: name ? String(name).trim() : cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(newUser);

    // Initial default accounts
    const initialAccounts: Account[] = [
      {
        id: 'acc_' + Date.now() + '_1',
        userId,
        name: 'BCA Main',
        type: 'bank',
        balance: 12500000,
        accountNumber: '•••• 4821',
        color: '#3b82f6', // blue
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_' + Date.now() + '_2',
        userId,
        name: 'Mandiri Payroll',
        type: 'bank',
        balance: 8000000,
        accountNumber: '•••• 9102',
        color: '#0284c7', // sky
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_' + Date.now() + '_3',
        userId,
        name: 'Physical Cash',
        type: 'cash',
        balance: 850000,
        color: '#10b981', // emerald
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    db.data.accounts.push(...initialAccounts);

    // Initial default investments (covering the 5 requested categories)
    const initialInvestments: Investment[] = [
      {
        id: 'inv_' + Date.now() + '_1',
        userId,
        name: 'BBCA (Bank Central Asia)',
        category: 'Saham',
        currency: 'IDR',
        amountInvested: 15000000,
        currentValue: 17200000,
        units: 17,
        platform: 'Ajaib / Sekuritas',
        notes: 'Blue chip banking stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv_' + Date.now() + '_2',
        userId,
        name: 'Sucorinvest Stable Fund',
        category: 'RDPU',
        currency: 'IDR',
        amountInvested: 10000000,
        currentValue: 10520000,
        platform: 'Bibit',
        notes: 'Low risk emergency fund asset',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv_' + Date.now() + '_3',
        userId,
        name: 'Bitcoin (BTC)',
        category: 'Bitcoin',
        currency: 'USD',
        amountInvested: 1200,
        currentValue: 1580,
        units: 0.0165,
        platform: 'Indodax / Cold Wallet',
        notes: 'Digital store of value',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv_' + Date.now() + '_4',
        userId,
        name: 'VOO - Vanguard S&P 500',
        category: 'ETF USA',
        currency: 'USD',
        amountInvested: 1500,
        currentValue: 1740,
        units: 3.2,
        platform: 'GoTrade / IBKR',
        notes: 'Broad market US index ETF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv_' + Date.now() + '_5',
        userId,
        name: 'USD Savings / Cash',
        category: 'USD',
        currency: 'USD',
        amountInvested: 600,
        currentValue: 600,
        units: 600,
        platform: 'Wise / Multi-currency',
        notes: 'Foreign currency liquid buffer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    db.data.investments.push(...initialInvestments);

    // Initial starter transactions
    const todayStr = new Date().toISOString().split('T')[0];
    const initialTransactions: Transaction[] = [
      {
        id: 'tx_' + Date.now() + '_1',
        userId,
        type: 'expense',
        amount: 85000,
        accountId: initialAccounts[0].id,
        category: 'Food & Dining',
        date: todayStr,
        notes: 'Lunch with team',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_' + Date.now() + '_2',
        userId,
        type: 'expense',
        amount: 45000,
        accountId: initialAccounts[2].id,
        category: 'Transportation',
        date: todayStr,
        notes: 'Taxi ride to station',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_' + Date.now() + '_3',
        userId,
        type: 'transfer',
        amount: 500000,
        accountId: initialAccounts[0].id,
        toAccountId: initialAccounts[2].id,
        category: 'Transfer to Cash',
        date: todayStr,
        notes: 'ATM Cash withdrawal',
        createdAt: new Date().toISOString(),
      },
    ];
    db.data.transactions.push(...initialTransactions);

    // Initial user settings
    db.data.settings.push({
      userId,
      usdIdrRate: 15850,
      privacyModeDefault: false,
      theme: 'dark',
    });

    db.save();

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register account' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.data.users.find(u => u.email === cleanEmail);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.data.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
});

// -------------------------------------------------------------
// ACCOUNTS ROUTES (Banks & Cash & E-wallets)
// -------------------------------------------------------------

app.get('/api/accounts', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const accounts = db.data.accounts.filter(a => a.userId === userId);
  res.json({ accounts });
});

app.post('/api/accounts', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, type, balance, accountNumber, color } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: 'Account name and type are required' });
      return;
    }

    const newAccount: Account = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      name: String(name).trim(),
      type: type === 'cash' ? 'cash' : type === 'ewallet' ? 'ewallet' : 'bank',
      balance: Number(balance) || 0,
      accountNumber: accountNumber ? String(accountNumber).trim() : undefined,
      color: color || '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.accounts.push(newAccount);
    db.save();

    res.status(201).json({ account: newAccount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.put('/api/accounts/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, type, balance, accountNumber, color } = req.body;

    const account = db.data.accounts.find(a => a.id === id && a.userId === userId);
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    if (name !== undefined) account.name = String(name).trim();
    if (type !== undefined) account.type = type;
    if (balance !== undefined) account.balance = Number(balance);
    if (accountNumber !== undefined) account.accountNumber = String(accountNumber).trim();
    if (color !== undefined) account.color = color;
    account.updatedAt = new Date().toISOString();

    db.save();
    res.json({ account });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account' });
  }
});

app.delete('/api/accounts/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const index = db.data.accounts.findIndex(a => a.id === id && a.userId === userId);
    if (index === -1) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    db.data.accounts.splice(index, 1);
    db.save();
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// -------------------------------------------------------------
// TRANSACTIONS (Expenses & Incomes)
// -------------------------------------------------------------

app.get('/api/transactions', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { type, accountId, limit } = req.query;

  let txs = db.data.transactions.filter(t => t.userId === userId);

  if (type) {
    txs = txs.filter(t => t.type === type);
  }
  if (accountId) {
    txs = txs.filter(t => t.accountId === accountId || t.toAccountId === accountId);
  }

  // Sort descending by date and createdAt
  txs.sort((a, b) => new Date(b.date + ' ' + b.createdAt).getTime() - new Date(a.date + ' ' + a.createdAt).getTime());

  if (limit) {
    txs = txs.slice(0, Number(limit));
  }

  res.json({ transactions: txs });
});

app.post('/api/transactions', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { type, amount, accountId, category, date, notes } = req.body;

    const parsedAmount = Math.abs(Number(amount));
    if (!parsedAmount || isNaN(parsedAmount)) {
      res.status(400).json({ error: 'Valid transaction amount is required' });
      return;
    }

    if (!accountId) {
      res.status(400).json({ error: 'Funding account is required' });
      return;
    }

    const account = db.data.accounts.find(a => a.id === accountId && a.userId === userId);
    if (!account) {
      res.status(404).json({ error: 'Funding account not found' });
      return;
    }

    const txType = type === 'income' ? 'income' : 'expense';

    // Update account balance
    if (txType === 'expense') {
      account.balance -= parsedAmount;
    } else {
      account.balance += parsedAmount;
    }
    account.updatedAt = new Date().toISOString();

    const newTx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      type: txType,
      amount: parsedAmount,
      accountId,
      category: category ? String(category).trim() : 'General',
      date: date || new Date().toISOString().split('T')[0],
      notes: notes ? String(notes).trim() : '',
      createdAt: new Date().toISOString(),
    };

    db.data.transactions.push(newTx);
    db.save();

    res.status(201).json({ transaction: newTx, updatedAccount: account });
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

app.put('/api/transactions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { type, amount, accountId, category, date, notes } = req.body;

    const tx = db.data.transactions.find(t => t.id === id && t.userId === userId);
    if (!tx) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Revert old transaction effect on original account
    const oldAccount = db.data.accounts.find(a => a.id === tx.accountId && a.userId === userId);
    if (oldAccount) {
      if (tx.type === 'expense') {
        oldAccount.balance += tx.amount;
      } else if (tx.type === 'income') {
        oldAccount.balance -= tx.amount;
      }
    }

    // Apply new values
    const newAmount = amount !== undefined ? Math.abs(Number(amount)) : tx.amount;
    const newType = type || tx.type;
    const targetAccountId = accountId || tx.accountId;

    const targetAccount = db.data.accounts.find(a => a.id === targetAccountId && a.userId === userId);
    if (targetAccount) {
      if (newType === 'expense') {
        targetAccount.balance -= newAmount;
      } else if (newType === 'income') {
        targetAccount.balance += newAmount;
      }
      targetAccount.updatedAt = new Date().toISOString();
    }

    tx.amount = newAmount;
    tx.type = newType;
    tx.accountId = targetAccountId;
    if (category !== undefined) tx.category = String(category).trim();
    if (date !== undefined) tx.date = date;
    if (notes !== undefined) tx.notes = String(notes).trim();

    db.save();
    res.json({ transaction: tx });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const txIndex = db.data.transactions.findIndex(t => t.id === id && t.userId === userId);
    if (txIndex === -1) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const tx = db.data.transactions[txIndex];

    // Revert account balance
    const account = db.data.accounts.find(a => a.id === tx.accountId && a.userId === userId);
    if (account) {
      if (tx.type === 'expense') {
        account.balance += tx.amount;
      } else if (tx.type === 'income') {
        account.balance -= tx.amount;
      }
    }

    // If it was transfer to account
    if (tx.type === 'transfer' && tx.toAccountId) {
      const toAccount = db.data.accounts.find(a => a.id === tx.toAccountId && a.userId === userId);
      if (toAccount) {
        toAccount.balance -= tx.amount;
      }
    }

    db.data.transactions.splice(txIndex, 1);
    db.save();

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// -------------------------------------------------------------
// TRANSFERS (Bank to Cash, Cash to Bank, Bank to Investment)
// -------------------------------------------------------------

app.post('/api/transfers', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const {
      type, // 'account_to_account' | 'bank_to_investment'
      fromAccountId,
      toAccountId,
      toInvestmentId,
      amountIdr,
      exchangeRate,
      date,
      notes,
    } = req.body;

    const amount = Math.abs(Number(amountIdr));
    if (!amount || isNaN(amount)) {
      res.status(400).json({ error: 'Valid transfer amount in IDR is required' });
      return;
    }

    const sourceAccount = db.data.accounts.find(a => a.id === fromAccountId && a.userId === userId);
    if (!sourceAccount) {
      res.status(404).json({ error: 'Source account not found' });
      return;
    }

    const txDate = date || new Date().toISOString().split('T')[0];

    // Scenario 1: Bank to Investment
    if (type === 'bank_to_investment') {
      if (!toInvestmentId) {
        res.status(400).json({ error: 'Target investment is required' });
        return;
      }

      const investment = db.data.investments.find(inv => inv.id === toInvestmentId && inv.userId === userId);
      if (!investment) {
        res.status(404).json({ error: 'Target investment not found' });
        return;
      }

      // Deduct source bank/cash account
      sourceAccount.balance -= amount;
      sourceAccount.updatedAt = new Date().toISOString();

      const rate = Number(exchangeRate) || getUserRate(userId);
      let addedInvestmentValue = amount;
      let amountUsd = undefined;

      if (investment.currency === 'USD') {
        amountUsd = Number((amount / rate).toFixed(2));
        investment.amountInvested += amountUsd;
        investment.currentValue += amountUsd;
      } else {
        investment.amountInvested += amount;
        investment.currentValue += amount;
      }
      investment.updatedAt = new Date().toISOString();

      const transferTx: Transaction = {
        id: 'tx_inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId,
        type: 'bank_to_investment',
        amount,
        accountId: fromAccountId,
        toInvestmentId,
        amountUsd,
        exchangeRate: rate,
        category: `Investment: ${investment.category}`,
        date: txDate,
        notes: notes ? String(notes).trim() : `Funded ${investment.name} from ${sourceAccount.name}`,
        createdAt: new Date().toISOString(),
      };

      db.data.transactions.push(transferTx);
      db.save();

      res.status(201).json({
        success: true,
        transaction: transferTx,
        sourceAccount,
        investment,
      });
      return;
    }

    // Scenario 2: Account to Account (e.g. Bank to Cash, Cash to Bank, Bank to Bank)
    if (!toAccountId) {
      res.status(400).json({ error: 'Destination account is required' });
      return;
    }

    if (fromAccountId === toAccountId) {
      res.status(400).json({ error: 'Source and destination accounts must be different' });
      return;
    }

    const destAccount = db.data.accounts.find(a => a.id === toAccountId && a.userId === userId);
    if (!destAccount) {
      res.status(404).json({ error: 'Destination account not found' });
      return;
    }

    // Transfer balances
    sourceAccount.balance -= amount;
    destAccount.balance += amount;
    sourceAccount.updatedAt = new Date().toISOString();
    destAccount.updatedAt = new Date().toISOString();

    const transferTx: Transaction = {
      id: 'tx_trf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      type: 'transfer',
      amount,
      accountId: fromAccountId,
      toAccountId,
      category: `Transfer to ${destAccount.name}`,
      date: txDate,
      notes: notes ? String(notes).trim() : `Transfer from ${sourceAccount.name} to ${destAccount.name}`,
      createdAt: new Date().toISOString(),
    };

    db.data.transactions.push(transferTx);
    db.save();

    res.status(201).json({
      success: true,
      transaction: transferTx,
      sourceAccount,
      destAccount,
    });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: 'Failed to complete transfer' });
  }
});

// -------------------------------------------------------------
// INVESTMENTS (USD, Bitcoin, Saham, RDPU, ETF USA)
// -------------------------------------------------------------

app.get('/api/investments', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const investments = db.data.investments.filter(inv => inv.userId === userId);
  res.json({ investments });
});

app.post('/api/investments', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, category, amountInvested, currentValue, units, platform, notes } = req.body;

    if (!name || !category) {
      res.status(400).json({ error: 'Investment name and category are required' });
      return;
    }

    // Valid categories: 'USD' | 'Bitcoin' | 'Saham' | 'RDPU' | 'ETF USA'
    const validCategories = ['USD', 'Bitcoin', 'Saham', 'RDPU', 'ETF USA'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
      return;
    }

    // Saham and RDPU are IDR; USD, Bitcoin, and ETF USA are USD
    const currency = (category === 'Saham' || category === 'RDPU') ? 'IDR' : 'USD';

    const invested = Number(amountInvested) || 0;
    const current = currentValue !== undefined ? Number(currentValue) : invested;

    const newInvestment: Investment = {
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      name: String(name).trim(),
      category,
      currency,
      amountInvested: invested,
      currentValue: current,
      units: units !== undefined && units !== '' ? Number(units) : undefined,
      platform: platform ? String(platform).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.investments.push(newInvestment);
    db.save();

    res.status(201).json({ investment: newInvestment });
  } catch (err) {
    console.error('Create investment error:', err);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

app.put('/api/investments/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, category, amountInvested, currentValue, units, platform, notes } = req.body;

    const inv = db.data.investments.find(i => i.id === id && i.userId === userId);
    if (!inv) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    if (name !== undefined) inv.name = String(name).trim();
    if (category !== undefined) {
      inv.category = category;
      inv.currency = (category === 'Saham' || category === 'RDPU') ? 'IDR' : 'USD';
    }
    if (amountInvested !== undefined) inv.amountInvested = Number(amountInvested);
    if (currentValue !== undefined) inv.currentValue = Number(currentValue);
    if (units !== undefined) inv.units = units !== '' ? Number(units) : undefined;
    if (platform !== undefined) inv.platform = String(platform).trim();
    if (notes !== undefined) inv.notes = String(notes).trim();
    inv.updatedAt = new Date().toISOString();

    db.save();
    res.json({ investment: inv });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

app.delete('/api/investments/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const index = db.data.investments.findIndex(i => i.id === id && i.userId === userId);
    if (index === -1) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    db.data.investments.splice(index, 1);
    db.save();
    res.json({ success: true, message: 'Investment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// -------------------------------------------------------------
// SETTINGS (USD/IDR exchange rate, etc.)
// -------------------------------------------------------------

app.get('/api/settings', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  let setting = db.data.settings.find(s => s.userId === userId);
  if (!setting) {
    setting = {
      userId,
      usdIdrRate: 15850,
      privacyModeDefault: false,
      theme: 'dark',
    };
    db.data.settings.push(setting);
    db.save();
  }
  res.json({ settings: setting });
});

app.put('/api/settings', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { usdIdrRate, privacyModeDefault, theme } = req.body;

    let setting = db.data.settings.find(s => s.userId === userId);
    if (!setting) {
      setting = {
        userId,
        usdIdrRate: 15850,
        privacyModeDefault: false,
        theme: 'dark',
      };
      db.data.settings.push(setting);
    }

    if (usdIdrRate !== undefined && !isNaN(Number(usdIdrRate)) && Number(usdIdrRate) > 0) {
      setting.usdIdrRate = Number(usdIdrRate);
    }
    if (privacyModeDefault !== undefined) {
      setting.privacyModeDefault = Boolean(privacyModeDefault);
    }
    if (theme !== undefined) {
      setting.theme = theme;
    }

    db.save();
    res.json({ settings: setting });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------

app.get('/api/stats/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const rate = getUserRate(userId);

    const userAccounts = db.data.accounts.filter(a => a.userId === userId);
    const userInvestments = db.data.investments.filter(i => i.userId === userId);
    const userTransactions = db.data.transactions.filter(t => t.userId === userId);

    // Calculate total liquid cash & bank in IDR
    const totalLiquidCashIdr = userAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Calculate investments breakdown
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

    // Total Net Worth in IDR
    const totalNetWorthIdr = totalLiquidCashIdr + totalInvestmentValueIdr;

    // Current month calculations
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

    // Expenses by category
    const expenseByCategory: Record<string, number> = {};
    thisMonthTxs
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other';
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
      });

    // Expenses by funding account
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

    res.json({
      rate,
      totalNetWorthIdr,
      totalLiquidCashIdr,
      totalInvestmentValueIdr,
      totalInvestmentValueUsd,
      totalInvestedCostIdr,
      unrealizedPnlIdr: totalInvestmentValueIdr - totalInvestedCostIdr,
      unrealizedPnlPercentage: totalInvestedCostIdr > 0 ? ((totalInvestmentValueIdr - totalInvestedCostIdr) / totalInvestedCostIdr) * 100 : 0,
      monthlyExpenses,
      monthlyIncomes,
      monthlyTransfersToInv,
      categoryAllocations,
      expenseByCategory,
      expenseByAccount,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// -------------------------------------------------------------
// VITE CLIENT MOUNTING
// -------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WealthTrack Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
});
