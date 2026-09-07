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
  demoLogin: () => void;
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEYS.TOKEN));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(AUTH_KEYS.USER);
    return raw ? JSON.parse(raw) : storageService.getUser();
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEYS.ONBOARDED) !== 'false';
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
    const localUser: User = {
      id: email === 'kailash@example.com' ? 'user_demo_1' : `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      monthlyIncome: 120000,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockToken = `token_${Date.now()}`;
    setToken(mockToken);
    setUser(localUser);
    localStorage.setItem(AUTH_KEYS.TOKEN, mockToken);
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
    const mockToken = `token_${Date.now()}`;
    setToken(mockToken);
    setUser(newUser);
    localStorage.setItem(AUTH_KEYS.TOKEN, mockToken);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(newUser));
    setIsOnboarded(false);
    localStorage.setItem(AUTH_KEYS.ONBOARDED, 'false');
  };

  const demoLogin = () => {
    const demoUser = storageService.getUser();
    const mockToken = 'token_demo_kailash';
    setToken(mockToken);
    setUser(demoUser);
    localStorage.setItem(AUTH_KEYS.TOKEN, mockToken);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(demoUser));
    localStorage.setItem(AUTH_KEYS.ONBOARDED, 'true');
    setIsOnboarded(true);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
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
        demoLogin,
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
