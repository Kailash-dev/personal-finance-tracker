import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Account, Category } from '@personal-finance/types';
import { dataProvider } from '../services/dataProvider';
import { storageService } from '../services/storageService';

export interface QuickModalPreset {
  categoryId?: string;
  subcategoryId?: string;
  description?: string;
  amount?: number;
  mode?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
}

interface FinanceContextType {
  user: User | null;
  accounts: Account[];
  categories: Category[];
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isQuickModalOpen: boolean;
  setIsQuickModalOpen: (open: boolean) => void;
  quickModalPreset: QuickModalPreset | null;
  openQuickModalWithPreset: (preset?: QuickModalPreset) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickModalPreset, setQuickModalPreset] = useState<QuickModalPreset | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('rupeetrack_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const openQuickModalWithPreset = (preset?: QuickModalPreset) => {
    setQuickModalPreset(preset || null);
    setIsQuickModalOpen(true);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rupeetrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [u, accs, cats] = await Promise.all([
        dataProvider.getUser(),
        dataProvider.getAccounts(),
        dataProvider.getCategories(),
      ]);
      setUser(u);
      setAccounts(accs);
      setCategories(cats);
    };
    loadInitialData();
  }, [refreshTrigger]);

  return (
    <FinanceContext.Provider
      value={{
        user,
        accounts,
        categories,
        selectedMonth,
        setSelectedMonth,
        refreshTrigger,
        triggerRefresh,
        theme,
        toggleTheme,
        isQuickModalOpen,
        setIsQuickModalOpen,
        quickModalPreset,
        openQuickModalWithPreset,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
