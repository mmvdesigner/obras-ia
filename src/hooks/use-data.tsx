
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs, query, setDoc, getDoc, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initialData } from '@/lib/data';
import type { AppData, Project, Employee, Expense, Task, InventoryItem, User, ProjectFile } from '@/lib/types';
import { useAuth } from './use-auth';

// Helper type for the form component
export type NewFileItem = { id: string; file: File };

interface DataContextType {
  data: AppData;
  loading: boolean;
  addProject: (projectData: Omit<Project, 'id' | 'files'>, filesToUpload: File[]) => Promise<void>;
  updateProject: (projectId: string, formData: Partial<Omit<Project, 'id' | 'files'>>, originalFiles: ProjectFile[], currentFiles: (ProjectFile | NewFileItem)[]) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<any>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>({
    users: [],
    projects: [],
    employees: [],
    expenses: [],
    tasks: [],
    inventory: [],
  });
  const [loading, setLoading] = useState(true);

  const seedDatabase = useCallback(async () => {
    console.log("Checking if database needs seeding...");
    const projectsQuery = query(collection(db, "projects"));
    const projectsSnapshot = await getDocs(projectsQuery);

    if (projectsSnapshot.empty) {
      console.log("Database is empty. Seeding with initial data...");
      const batch = writeBatch(db);

      (Object.keys(initialData) as Array<keyof AppData>).forEach(key => {
        initialData[key].forEach((item: any) => {
          if (!item.id || item.id.includes('CHANGE_ME')) return;
          const docRef = doc(db, key, item.id);
          const {id, ...itemData} = item;
          batch.set(docRef, itemData);
        });
      });
      
      await batch.commit();
      console.log("Database seeded successfully.");
    } else {
      console.log("Database already has data. No seeding required.");
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await seedDatabase();

      const collections: (keyof AppData)[] = ['users', 'projects', 'employees', 'expenses', 'tasks', 'inventory'];
      const unsubscribes = collections.map(collectionName => {
        return onSnapshot(collection(db, collectionName), (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
          setData(prevData => ({ ...prevData, [collectionName]: items }));
        }, (error) => {
          console.error(`Error fetching ${collectionName}:`, error);
        });
      });

      setLoading(false);
      
      return () => unsubscribes.forEach(unsub => unsub());
    };

    initializeData();
  }, [seedDatabase]);

  const addUser = async (userData: Omit<User, 'id'>) => {
    // In a real app, this would be a Cloud Function that creates a Firebase Auth user
    // and then creates the Firestore document.
    // For the prototype, we'll just add the user to the Firestore collection.
    // The password will be ignored.
    const { password, ...firestoreData } = userData;
    const finalUserData = { ...firestoreData, avatar: 'https://placehold.co/100x100.png' };
    await addDoc(collection(db, 'users'), finalUserData);
  };

  const updateUser = async (updatedUser: User) => {
    if (!updatedUser.id) {
      console.error("Cannot update user without an ID.");
      return;
    }
    try {
      const { id, ...userData } = updatedUser;
      const userDocRef = doc(db, 'users', id);
      await setDoc(userDocRef, userData, { merge: true });
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  }

  const deleteUser = async (userId: string) => {
    // In a real app, this would be a Cloud Function that also deletes the user from Firebase Auth.
    await deleteDoc(doc(db, 'users', userId));
  }


  const addProject = async (projectData: Omit<Project, 'id' | 'files'>, filesToUpload: File[]) => {
    try {
        const docRef = await addDoc(collection(db, 'projects'), { ...projectData, files: [] });
        // This functionality is currently disabled due to CORS issues.
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
  };
  
  const updateProject = async (
    projectId: string, 
    formData: Partial<Omit<Project, 'id' | 'files'>>, 
    originalFiles: ProjectFile[], 
    currentFiles: (ProjectFile | NewFileItem)[]
  ) => {
    try {
      // This functionality is currently disabled due to CORS issues.
      const projectDocRef = doc(db, 'projects', projectId);
      await updateDoc(projectDocRef, {
        ...formData,
      });

    } catch (error) {
      console.error("Error updating project:", error);
      throw error; 
    }
  };


  const deleteProject = async (projectId: string) => {
    await deleteDoc(doc(db, 'projects', projectId));
  };
  
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    await addDoc(collection(db, 'employees'), employee);
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    const { id, ...data } = updatedEmployee;
    await setDoc(doc(db, 'employees', id), data, { merge: true });
  };

  const deleteEmployee = async (employeeId: string) => {
    await deleteDoc(doc(db, 'employees', employeeId));
  };
  
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const batch = writeBatch(db);
    const expenseRef = doc(collection(db, 'expenses'));
    batch.set(expenseRef, expenseData);

    if (expenseData.category === 'material' && expenseData.materialName && expenseData.quantity && expenseData.unitPrice && expenseData.unit) {
        const inventoryQuery = query(collection(db, 'inventory'), 
            doc('projectId', '==', expenseData.projectId), 
            doc('name', '==', expenseData.materialName)
        );
        const inventorySnapshot = await getDocs(inventoryQuery);
        
        if (inventorySnapshot.empty) {
            const newInventoryItemRef = doc(collection(db, 'inventory'));
            batch.set(newInventoryItemRef, {
                projectId: expenseData.projectId,
                name: expenseData.materialName,
                quantity: expenseData.quantity,
                unit: expenseData.unit,
                averagePrice: expenseData.unitPrice,
            });
        } else {
            const itemDoc = inventorySnapshot.docs[0];
            const itemData = itemDoc.data() as InventoryItem;
            const newQuantity = itemData.quantity + expenseData.quantity;
            const newAveragePrice = ((itemData.averagePrice * itemData.quantity) + (expenseData.unitPrice * expenseData.quantity)) / newQuantity;
            
            batch.update(itemDoc.ref, {
                quantity: newQuantity,
                averagePrice: newAveragePrice,
            });
        }
    }
    await batch.commit();
    return expenseRef;
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
    const { id, ...data } = updatedExpense;
    await setDoc(doc(db, 'expenses', id), data, { merge: true });
  };
  
  const deleteExpense = async (expenseId: string) => {
    await runTransaction(db, async (transaction) => {
      const expenseRef = doc(db, "expenses", expenseId);
      const expenseDoc = await transaction.get(expenseRef);
      if (!expenseDoc.exists()) {
        throw "Expense does not exist!";
      }

      const expenseData = expenseDoc.data() as Expense;
      if (expenseData.category === 'material' && expenseData.materialName && expenseData.quantity) {
        const inventoryQuery = query(
          collection(db, 'inventory'), 
          doc('projectId', '==', expenseData.projectId),
          doc('name', '==', expenseData.materialName)
        );
        const inventorySnapshot = await getDocs(inventoryQuery);
        if (!inventorySnapshot.empty) {
            const itemDoc = inventorySnapshot.docs[0];
            const currentQuantity = itemDoc.data().quantity || 0;
            transaction.update(itemDoc.ref, { quantity: currentQuantity - expenseData.quantity });
        }
      }
      transaction.delete(expenseRef);
    });
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    await addDoc(collection(db, 'tasks'), task);
  };
  
  const updateTask = async (updatedTask: Task) => {
    const { id, ...data } = updatedTask;
    await setDoc(doc(db, 'tasks', id), data, { merge: true });
  };
  
  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    await addDoc(collection(db, 'inventory'), item);
  };

  const value: DataContextType = {
    data,
    loading, 
    addProject,
    updateProject,
    deleteProject,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addExpense,
    updateExpense,
    deleteExpense,
    addTask,
    updateTask,
    deleteTask,
    addInventoryItem,
    addUser,
    updateUser,
    deleteUser,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
