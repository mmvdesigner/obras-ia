'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs, query, setDoc, getDoc, where } from 'firebase/firestore';
import { initialData } from '@/lib/data';
import type { AppData, Project, Employee, Expense, Task, InventoryItem } from '@/lib/types';
import { useAuth } from './use-auth';

interface DataContextType {
  data: AppData;
  loading: boolean;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AppData>({
    users: [], // users are now primarily handled by useAuth
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
        
        // Note: Users are now seeded in use-auth.tsx on first login.
        // Seeding other collections here.
        initialData.projects.forEach((item: Project) => {
            const docRef = doc(db, "projects", item.id);
            const {id, ...itemData} = item;
            batch.set(docRef, itemData);
        });
        initialData.employees.forEach((item: Employee) => {
            const docRef = doc(db, "employees", item.id);
            const {id, ...itemData} = item;
            batch.set(docRef, itemData);
        });
        initialData.expenses.forEach((item: Expense) => {
            const docRef = doc(db, "expenses", item.id);
            const {id, ...itemData} = item;
            batch.set(docRef, itemData);
        });
        initialData.tasks.forEach((item: Task) => {
            const docRef = doc(db, "tasks", item.id);
            const {id, ...itemData} = item;
            batch.set(docRef, itemData);
        });
        initialData.inventory.forEach((item: InventoryItem) => {
            const docRef = doc(db, "inventory", item.id);
            const {id, ...itemData} = item;
            batch.set(docRef, itemData);
        });

        await batch.commit();
        console.log("Database seeded successfully.");
    } else {
        console.log("Database already has data. No seeding required.");
    }
  }, []);


  useEffect(() => {
    // Only proceed if auth has finished loading and we have a user
    if (!authLoading && user) {
      seedDatabase(); // Check if the rest of the DB needs seeding

      const collections: (keyof AppData)[] = ['projects', 'employees', 'expenses', 'tasks', 'inventory', 'users'];
      const unsubscribes = collections.map(collectionName => {
        return onSnapshot(collection(db, collectionName), (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
          setData(prevData => ({ ...prevData, [collectionName]: items }));
        }, (error) => {
          console.error(`Error fetching ${collectionName}:`, error);
        });
      });

      setLoading(false); // Data loading is complete
      
      return () => unsubscribes.forEach(unsub => unsub());

    } else if (!authLoading && !user) {
      // If auth is done and there's no user, stop loading.
      setLoading(false);
    }
  }, [user, authLoading, seedDatabase]);


  // Firestore operations
  const addProject = async (project: Omit<Project, 'id'>) => {
    await addDoc(collection(db, 'projects'), project);
  };

  const updateProject = async (updatedProject: Project) => {
    const { id, ...data } = updatedProject;
    await setDoc(doc(db, 'projects', id), data, { merge: true });
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
  
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
      const docRef = await addDoc(collection(db, 'expenses'), expense);
      
      // Update inventory
      if (expense.category === 'material' && expense.materialName && expense.quantity && expense.unitPrice) {
          const inventoryQuery = query(collection(db, 'inventory'), where('projectId', '==', expense.projectId), where('name', '==', expense.materialName));
          const inventorySnapshot = await getDocs(inventoryQuery);
          
          if (!inventorySnapshot.empty) {
              const existingItemDoc = inventorySnapshot.docs[0];
              const existingItem = existingItemDoc.data() as InventoryItem;

              const totalQuantity = existingItem.quantity + expense.quantity;
              const newAveragePrice = ((existingItem.quantity * existingItem.averagePrice) + (expense.quantity * expense.unitPrice)) / totalQuantity;
              
              await updateDoc(existingItemDoc.ref, {
                  quantity: totalQuantity,
                  averagePrice: newAveragePrice,
              });
          } else {
              await addDoc(collection(db, 'inventory'), {
                  projectId: expense.projectId,
                  name: expense.materialName,
                  quantity: expense.quantity,
                  unit: expense.unit || 'unidade',
                  averagePrice: expense.unitPrice,
              });
          }
      }
      return docRef;
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
    const { id, ...data } = updatedExpense;
    await setDoc(doc(db, 'expenses', id), data, { merge: true });
  };
  
  const deleteExpense = async (expenseId: string) => {
    await deleteDoc(doc(db, 'expenses', expenseId));
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
    loading: loading, 
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
    addInventoryItem
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
