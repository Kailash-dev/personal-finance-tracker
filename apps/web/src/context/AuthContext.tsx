import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@personal-finance/types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, name: string, monthlyIncome?: number) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEYS = {
  TOKEN: 'rupeetrack_token',
  USER: 'rupeetrack_auth_user',
  ONBOARDED: 'rupeetrack_onboarded',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEYS.TOKEN) || 'token_kailash_active');
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(AUTH_KEYS.USER);
    if (raw) return JSON.parse(raw);
    const defaultUser: User = {
      id: 'user_kailash',
      name: 'Kailash',
      email: 'kailash@personal-finance.local',
      monthlyIncome: 50000,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(defaultUser));
    localStorage.setItem(AUTH_KEYS.TOKEN, 'token_kailash_active');
    localStorage.setItem(AUTH_KEYS.ONBOARDED, 'true');
    return defaultUser;
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const raw = localStorage.getItem(AUTH_KEYS.ONBOARDED);
    if (raw !== null) return raw === 'true';
    return true;
  });

  const isAuthenticated = !!user;

  const login = async (email: string, password?: string) => {
    // If backend is active, authenticate with API; otherwise authenticate locally
    const API_BASE_URL = import.meta.env?.VITE_API_URL || '';
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
          localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
          localStorage.setItem(AUTH_KEYS.ONBOARDED, 'true');
          setIsOnboarded(true);
          return;
        }
      } catch {
        // Fallback to local
      }
    }

    // Local authentication
    const existingRaw = localStorage.getItem(AUTH_KEYS.USER);
    const existing = existingRaw ? JSON.parse(existingRaw) : null;

    const localUser: User = {
      id: existing?.email === email ? existing.id : `user_${Date.now()}`,
      email,
      name: existing?.name || email.split('@')[0],
      monthlyIncome: existing?.monthlyIncome || 0,
      currency: 'INR',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const localToken = `token_${Date.now()}`;
    setToken(localToken);
    setUser(localUser);
    localStorage.setItem(AUTH_KEYS.TOKEN, localToken);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(localUser));
    localStorage.setItem(AUTH_KEYS.ONBOARDED, 'true');
    setIsOnboarded(true);
  };

  const register = async (email: string, password: string, name: string, monthlyIncome?: number) => {
    const API_BASE_URL = import.meta.env?.VITE_API_URL || '';
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, monthlyIncome }),
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
          localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
          setIsOnboarded(false);
          localStorage.setItem(AUTH_KEYS.ONBOARDED, 'false');
          return;
        }
      } catch {
        // fallback
      }
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      monthlyIncome: monthlyIncome || 0,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const localToken = `token_${Date.now()}`;
    setToken(localToken);
    setUser(newUser);
    localStorage.setItem(AUTH_KEYS.TOKEN, localToken);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(newUser));
    setIsOnboarded(false);
    localStorage.setItem(AUTH_KEYS.ONBOARDED, 'false');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.ONBOARDED);
  };

  const completeOnboarding = async (data: any) => {
    if (user) {
      const updatedUser = {
        ...user,
        monthlyIncome: data.monthlyIncome,
      };
      setUser(updatedUser);
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(updatedUser));
      localStorage.setItem(AUTH_KEYS.ONBOARDED, 'true');
      setIsOnboarded(true);

      // Create primary bank account if not present
      const accounts = storageService.getAccounts();
      if (accounts.length === 0) {
        storageService.createAccount({
          userId: user.id,
          name: `${data.bankName || 'HDFC'} Salary Account`,
          type: 'SALARY',
          bank: data.bankName || 'HDFC',
          accountNumberMasked: `${data.bankName || 'HDFC'} ****${Math.floor(1000 + Math.random() * 9000)}`,
          currentBalance: data.currentBankBalance,
          openingBalance: data.currentBankBalance,
          currency: 'INR',
          isActive: true,
        });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isOnboarded,
        login,
        register,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
