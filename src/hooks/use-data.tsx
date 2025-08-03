'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs, query, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initialData } from '@/lib/data';
import type { AppData, Project, Employee, Expense, Task, InventoryItem, User, ProjectFile } from '@/lib/types';
import { useAuth } from './use-auth';

interface DataContextType {
  data: AppData;
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'files'>, files: File[]) => Promise<void>;
  updateProject: (project: Project, formData: Omit<Project, 'id' | 'files'>, newFiles: File[], filesToDelete: ProjectFile[]) => Promise<void>;
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

  // This function seeds the database with initial data if it's empty.
  const seedDatabase = useCallback(async () => {
    console.log("Checking if database needs seeding...");
    const projectsQuery = query(collection(db, "projects"));
    const projectsSnapshot = await getDocs(projectsQuery);

    if (projectsSnapshot.empty) {
      console.log("Database is empty. Seeding with initial data...");
      const batch = writeBatch(db);

      // Seed all collections from initialData, including users this time
      (Object.keys(initialData) as Array<keyof AppData>).forEach(key => {
        initialData[key].forEach((item: any) => {
          if (!item.id || item.id.includes('CHANGE_ME')) return; // Don't seed items without a valid ID
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


  const uploadFile = async (file: File, projectId: string): Promise<ProjectFile> => {
    const filePath = `projects/${projectId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { name: file.name, url, path: filePath };
  };

  const deleteFile = async (file: ProjectFile) => {
    if (file?.path) {
      const storageRef = ref(storage, file.path);
      await deleteObject(storageRef);
    }
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

  const addProject = async (project: Omit<Project, 'id' | 'files'>, filesToUpload: File[]) => {
    const projectRef = doc(collection(db, 'projects'));
    const uploadedFiles = await Promise.all(
        filesToUpload.map(file => uploadFile(file, projectRef.id))
    );
    await setDoc(projectRef, { ...project, files: uploadedFiles });
  };
  
 const updateProject = async (project: Project, formData: Omit<Project, 'id' | 'files'>, newFiles: File[], filesToDelete: ProjectFile[]) => {
    const projectDocRef = doc(db, 'projects', project.id);
  
    // 1. Delete files from Storage that were marked for deletion
    const validFilesToDelete = filesToDelete.filter(f => f && f.path);
    await Promise.all(validFilesToDelete.map(file => deleteFile(file)));
  
    // 2. Upload new files to Storage
    const uploadedFiles = await Promise.all(newFiles.map(file => uploadFile(file, project.id)));
  
    // 3. Filter out deleted files from the original project files list
    const originalFiles = project.files || [];
    const remainingOldFiles = originalFiles.filter(
      (originalFile) => !validFilesToDelete.some((deletedFile) => deletedFile.path === originalFile.path)
    );

    // 4. Combine remaining old files with newly uploaded files
    const finalFiles = [...remainingOldFiles, ...uploadedFiles];
  
    // 5. Create the final object to update in Firestore
    const dataToUpdate = {
        ...formData,
        files: finalFiles 
    };
  
    // 6. Update the project document in Firestore
    await updateDoc(projectDocRef, dataToUpdate);
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
