'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './use-local-storage';
import { initialData } from '@/lib/data';
import type { AppData, Project, Employee, Expense, Task, InventoryItem } from '@/lib/types';

interface DataContextType {
  data: AppData;
  setData: (value: AppData | ((val: AppData) => AppData)) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateId = () => new Date().getTime().toString();

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<AppData>('buildwise-data', initialData);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: generateId() };
    setData(prevData => ({ ...prevData, projects: [...prevData.projects, newProject] }));
  };

  const updateProject = (updatedProject: Project) => {
    setData(prevData => ({
      ...prevData,
      projects: prevData.projects.map(p => (p.id === updatedProject.id ? updatedProject : p)),
    }));
  };

  const deleteProject = (projectId: string) => {
    setData(prevData => ({ ...prevData, projects: prevData.projects.filter(p => p.id !== projectId) }));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: generateId() };
    setData(prevData => ({ ...prevData, employees: [...prevData.employees, newEmployee] }));
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setData(prevData => ({
      ...prevData,
      employees: prevData.employees.map(e => (e.id === updatedEmployee.id ? updatedEmployee : e)),
    }));
  };

  const deleteEmployee = (employeeId: string) => {
    setData(prevData => ({ ...prevData, employees: prevData.employees.filter(e => e.id !== employeeId) }));
  };
  
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: generateId() };
    setData(prevData => {
        let newInventory = [...prevData.inventory];
        if (expense.category === 'material' && expense.materialName && expense.quantity && expense.unitPrice) {
            const itemIndex = newInventory.findIndex(i => i.projectId === expense.projectId && i.name.toLowerCase() === expense.materialName!.toLowerCase());
            
            if (itemIndex > -1) {
                // Update existing item
                const existingItem = newInventory[itemIndex];
                const totalQuantity = existingItem.quantity + expense.quantity;
                const newAveragePrice = ((existingItem.quantity * existingItem.averagePrice) + (expense.quantity * expense.unitPrice)) / totalQuantity;
                
                newInventory[itemIndex] = {
                    ...existingItem,
                    quantity: totalQuantity,
                    averagePrice: newAveragePrice,
                };
            } else {
                // Add new item
                newInventory.push({
                    id: generateId(),
                    projectId: expense.projectId,
                    name: expense.materialName,
                    quantity: expense.quantity,
                    unit: 'unidade', // default unit, maybe this should be in the form
                    averagePrice: expense.unitPrice,
                });
            }
        }
        return { ...prevData, expenses: [...prevData.expenses, newExpense], inventory: newInventory };
    });
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    setData(prevData => ({
      ...prevData,
      // Note: Updating inventory based on an updated expense is complex and not implemented here.
      // It would require knowing the original state of the expense.
      expenses: prevData.expenses.map(e => (e.id === updatedExpense.id ? updatedExpense : e)),
    }));
  };
  
  const deleteExpense = (expenseId: string) => {
     // Note: Deleting inventory based on a deleted expense is complex and not implemented here.
    setData(prevData => ({ ...prevData, expenses: prevData.expenses.filter(e => e.id !== expenseId) }));
  };
  
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: generateId() };
    setData(prevData => ({ ...prevData, tasks: [...prevData.tasks, newTask] }));
  };
  
  const updateTask = (updatedTask: Task) => {
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)),
    }));
  };
  
  const deleteTask = (taskId: string) => {
    setData(prevData => ({ ...prevData, tasks: prevData.tasks.filter(t => t.id !== taskId) }));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setData(prevData => ({...prevData, inventory: [...prevData.inventory, newItem]}));
  };

  return (
    <DataContext.Provider value={{ data, setData, addProject, updateProject, deleteProject, addEmployee, updateEmployee, deleteEmployee, addExpense, updateExpense, deleteExpense, addTask, updateTask, deleteTask, addInventoryItem }}>
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
