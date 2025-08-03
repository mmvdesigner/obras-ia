'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User as AppUser } from '@/lib/types';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { initialData } from '@/lib/data';
import { db } from '@/lib/firebase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserDoc = useCallback(async (firebaseUser: FirebaseUser): Promise<AppUser | null> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as AppUser;
    } else {
      console.log("User document doesn't exist, creating one...");
      const initialUser = initialData.users.find(u => u.email === firebaseUser.email);
      
      if (initialUser) {
        const { id, ...userData } = initialUser;
        const newUserData = { ...userData, email: firebaseUser.email! }; // ensure email is from auth
        await setDoc(userDocRef, newUserData);
        console.log("User document created successfully.");
        return { id: firebaseUser.uid, ...newUserData } as AppUser;
      }
      console.error("Could not find initial user data for email:", firebaseUser.email);
      return null;
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        const appUser = await fetchUserDoc(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserDoc]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const auth = getAuth();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle fetching user doc and setting state
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
