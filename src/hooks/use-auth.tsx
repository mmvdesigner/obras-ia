'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AppData } from '@/lib/types';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DataProvider } from './use-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


function AuthProviderContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their custom data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not in Firestore
          console.warn("User authenticated with Firebase but not found in Firestore:", firebaseUser.uid);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state.
      // We can then safely redirect.
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
        // onAuthStateChanged will handle clearing the user state
        setLoading(false);
    }
  };

  const updateUser = useCallback(async (updatedUser: User) => {
     try {
      const { id, ...userData } = updatedUser;
      const userDocRef = doc(db, 'users', id);
      await setDoc(userDocRef, userData, { merge: true });
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <AuthProviderContent>
            <DataProvider>{children}</DataProvider>
        </AuthProviderContent>
    );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
