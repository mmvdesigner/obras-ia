'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialData } from '@/lib/data';
import { DataProvider } from './use-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This component now contains all the logic and correctly wraps the DataProvider
function AuthProviderContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        // User is signed in, let's get their profile or create it if it doesn't exist
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log(`User document for ${firebaseUser.uid} not found. Creating one.`);
          // Find the corresponding seed data for the user
          const seedUser = initialData.users.find(u => u.id === firebaseUser.uid);
          if (seedUser) {
            const { id, ...userData } = seedUser;
            await setDoc(userDocRef, userData);
            userDoc = await getDoc(userDocRef); // Re-fetch the doc after creation
          } else {
             console.error("User authenticated but not found in initialData. Cannot create profile.");
             await signOut(auth); // Log out user to prevent being stuck
             setUser(null);
             setLoading(false);
             return;
          }
        }
        
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);
        
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state and loading.
      // We no longer redirect here to avoid race conditions.
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
        setUser(null);
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
      {/* The key fix: The DataProvider is now INSIDE AuthContext.Provider */}
      {/* so it will re-render when auth state (user, loading) changes. */}
      <DataProvider>
        {children}
      </DataProvider>
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <AuthProviderContent>
            {/* We no longer need the wrapper here */}
            {children}
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
