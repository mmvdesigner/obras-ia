'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from './use-local-storage';
import { initialData } from '@/lib/data';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // on initial load, check local storage
    const storedUser = window.localStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [setUser]);


  const login = (role: UserRole) => {
    const userToLogin = initialData.users.find(u => u.role === role);
    if (userToLogin) {
      setUser(userToLogin);
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
