'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from './use-local-storage';
import type { User, UserRole, AppData } from '@/lib/types';
import { useData } from './use-data';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const dataContext = useData();

  useEffect(() => {
    // on initial load, check local storage
    const storedUser = window.localStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = async (role: UserRole) => {
      setLoading(true);
      if (dataContext.data.users.length > 0) {
        const userToLogin = dataContext.data.users.find(u => u.role === role);
        if (userToLogin) {
            setUser(userToLogin);
            router.push('/dashboard');
        } else {
            console.error("Could not find user for role:", role);
        }
      } else {
          // Fallback if data isn't loaded yet
          const userId = role === 'Administrator' ? '1' : '2';
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
              const userToLogin = {id: userDoc.id, ...userDoc.data()} as User;
              setUser(userToLogin);
              router.push('/dashboard');
          }
      }
      setLoading(false);
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const updateUser = useCallback(async (updatedUser: User) => {
      setUser(updatedUser);
      // The update will be handled by the onSnapshot listener in useData
      // but we can trigger a direct update for immediate feedback if needed.
      // For now, we rely on the real-time listener.
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// This wrapper now only provides the DataProvider
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
