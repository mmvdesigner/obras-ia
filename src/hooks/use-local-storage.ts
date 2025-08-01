'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppData } from '@/lib/types';

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target: any, source: any) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        // Simple array merge: prefer source, but you could implement more complex logic
        output[key] = source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

// Data migration and cleaning logic
function cleanInitialData(data: AppData): AppData {
    const cleanedData = { ...data };
    if (!cleanedData.inventory) {
        cleanedData.inventory = [];
    }
    cleanedData.projects = cleanedData.projects.map(p => ({
        ...p,
        files: p.files || [],
    }));
    return cleanedData;
}


export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This function now only runs on the client, and only on the first render.
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      if (!item) {
        const cleanedInitial = cleanInitialData(initialValue as AppData) as T;
        window.localStorage.setItem(key, JSON.stringify(cleanedInitial));
        return cleanedInitial;
      }
      const parsedItem = JSON.parse(item);
      const mergedData = mergeDeep(initialValue, parsedItem);
      const cleanedData = cleanInitialData(mergedData as AppData) as T;
      
      // Update local storage with the cleaned, merged data to ensure it's up-to-date
      if (JSON.stringify(cleanedData) !== item) {
          window.localStorage.setItem(key, JSON.stringify(cleanedData));
      }

      return cleanedData;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);


  return [storedValue, setValue];
}
