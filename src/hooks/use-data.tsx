'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs, query, setDoc, where } from 'firebase/firestore';
import { initialData } from '@/lib/data';
import type { AppData, Project, Employee, Expense, Task, InventoryItem, User } from '@/lib/types';

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
  updateUser: (user: User) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    users: [],
    projects: [],
    employees: [],
    expenses: [],
    tasks: [],
    inventory: [],
  });
  const [loading, setLoading] = useState(true);

  // This function seeds the database with initial data if it's empty.
  const seedDatabase = useCallback(async () => {
    console.log("Checking if database needs seeding...");
    const projectsQuery = query(collection(db, "projects"));
    const projectsSnapshot = await getDocs(projectsQuery);

    if (projectsSnapshot.empty) {
        console.log("Database is empty. Seeding with initial data...");
        const batch = writeBatch(db);
        
        // Seed all collections from initialData
        (Object.keys(initialData) as Array<keyof AppData>).forEach(key => {
            initialData[key].forEach((item: any) => {
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

        // Set up listeners for all collections after seeding check
        const collections: (keyof AppData)[] = ['users', 'projects', 'employees', 'expenses', 'tasks', 'inventory'];
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
    };

    initializeData();
  }, [seedDatabase]);


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
    addInventoryItem,
    updateUser
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
