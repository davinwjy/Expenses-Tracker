import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { AccountsView } from './components/AccountsView';
import { InvestmentsView } from './components/InvestmentsView';
import { StatsView } from './components/StatsView';
import { AddExpenseModal } from './components/Modals/AddExpenseModal';
import { TransferModal } from './components/Modals/TransferModal';
import { AccountModal } from './components/Modals/AccountModal';
import { InvestmentModal } from './components/Modals/InvestmentModal';
import { AuthModal } from './components/AuthModal';
import { Wallet, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeTab } = useFinance();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
          <Wallet className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Synchronizing WealthTrack session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'expenses' && <ExpensesView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'investments' && <InvestmentsView />}
        {activeTab === 'stats' && <StatsView />}
      </main>

      {/* Mobile Floating & Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Modals */}
      <AddExpenseModal />
      <TransferModal />
      <AccountModal />
      <InvestmentModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainAppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
