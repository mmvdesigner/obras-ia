'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from './use-local-storage';
import { initialData } from '@/lib/data';
import type { User, UserRole } from '@/lib/types';
import { useData, DataProvider } from './use-data';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  loading: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: appData, setData: setAppData } = useData();

  useEffect(() => {
    // on initial load, check local storage
    const storedUser = window.localStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = (role: UserRole) => {
    const userToLogin = appData.users.find(u => u.role === role);
    if (userToLogin) {
      setUser(userToLogin);
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const updateUser = useCallback((updatedUser: User) => {
      setUser(updatedUser);
      setAppData(prevData => ({
          ...prevData,
          users: prevData.users.map(u => u.id === updatedUser.id ? updatedUser : u)
      }))
  }, [setUser, setAppData]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom provider wrapper to include DataProvider
function AuthProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <DataProvider>
            <AuthProvider>{children}</AuthProvider>
        </DataProvider>
    )
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Exporting the wrapper as the main provider for layout files
export { AuthProviderWrapper as AuthProvider };
