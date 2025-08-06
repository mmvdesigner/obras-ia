
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, getDocs, query, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initialData } from '@/lib/data';
import type { AppData, Project, Employee, Expense, Task, InventoryItem, User, ProjectFile } from '@/lib/types';
import { useAuth } from './use-auth';

interface DataContextType {
  data: AppData;
  loading: boolean;
  addProject: (projectData: Omit<Project, 'id' | 'files'>, filesToUpload: File[]) => Promise<void>;
  updateProject: (projectId: string, formData: Partial<Omit<Project, 'id' | 'files'>>, originalFiles: ProjectFile[], currentFiles: (ProjectFile | File)[]) => Promise<void>;
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

  const addProject = async (projectData: Omit<Project, 'id' | 'files'>, filesToUpload: File[]) => {
    try {
        const docRef = await addDoc(collection(db, 'projects'), { ...projectData, files: [] });
        const projectId = docRef.id;

        const uploadedFiles: ProjectFile[] = [];
        for (const file of filesToUpload) {
            try {
                const storagePath = `projects/${projectId}/${Date.now()}-${file.name}`;
                const fileRef = ref(storage, storagePath);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                uploadedFiles.push({ name: file.name, url, path: storagePath });
            } catch (err) {
                console.error(`Error uploading file ${file.name}:`, err);
                throw new Error(`Failed to upload file "${file.name}". Please try again.`);
            }
        }

        await updateDoc(docRef, { files: uploadedFiles });
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
  };
  
  const updateProject = async (
    projectId: string, 
    formData: Partial<Omit<Project, 'id' | 'files'>>, 
    originalFiles: ProjectFile[], 
    currentFiles: (ProjectFile | File)[]
  ) => {
    try {
      // 1. Identify files to delete by comparing original and current lists.
      const currentFilePaths = new Set(
        currentFiles.filter((f): f is ProjectFile => !(f instanceof File)).map(f => f.path)
      );
      const filesToDelete = originalFiles.filter(orig => !currentFilePaths.has(orig.path));

      // 2. Delete files from Storage.
      for (const file of filesToDelete) {
        try {
            const fileRef = ref(storage, file.path);
            await deleteObject(fileRef);
        } catch (err) {
            console.error(`Error deleting file ${file.path}:`, err);
            // Optionally decide if this should stop the whole process
            throw new Error(`Failed to delete file "${file.name}". Please check permissions.`);
        }
      }

      // 3. Identify and upload new files.
      const newFilesToUpload = currentFiles.filter((f): f is File => f instanceof File);
      const uploadedFiles: ProjectFile[] = [];

      for (const file of newFilesToUpload) {
          try {
            const storagePath = `projects/${projectId}/${Date.now()}-${file.name}`;
            const fileRef = ref(storage, storagePath);
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);
            uploadedFiles.push({
                name: file.name,
                url: downloadURL,
                path: storagePath,
            });
          } catch (err) {
            console.error(`Error uploading file ${file.name}:`, err);
            // Re-throw a more user-friendly error to be caught by the form's submit handler
            throw new Error(`Failed to upload file "${file.name}". Please try again.`);
          }
      }

      // 4. Consolidate the final list of files for Firestore.
      const finalFiles: ProjectFile[] = [
        ...currentFiles.filter((f): f is ProjectFile => !(f instanceof File)),
        ...uploadedFiles,
      ];

      // 5. Update Firestore with new data and the final file list.
      const projectDocRef = doc(db, 'projects', projectId);
      await updateDoc(projectDocRef, {
        ...formData,
        files: finalFiles,
      });

    } catch (error) {
      console.error("Error updating project:", error);
      // Re-throw the error to be caught by the form's submit handler
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
