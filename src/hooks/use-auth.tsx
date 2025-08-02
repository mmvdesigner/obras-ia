'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from './use-local-storage';
import type { User, UserRole, AppData } from '@/lib/types';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
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
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", role));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userToLogin = {id: userDoc.id, ...userDoc.data()} as User;
          setUser(userToLogin);
          router.push('/dashboard');
      } else {
         console.error("Could not find user for role:", role);
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
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
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
