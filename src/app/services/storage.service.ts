import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  /**
   * Create or save a new item to localStorage
   * @param key The key to store the item under
   * @param value The value to store (will be JSON serialized)
   */
  create(key: string, value: any): void {
    try {
      if (!key || key.trim() === '') {
        console.error('StorageService: Key cannot be empty');
        return;
      }
      const jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
    } catch (error) {
      console.error('StorageService: Error creating item', error);
    }
  }

  /**
   * Read an item from localStorage
   * @param key The key to retrieve
   * @returns The parsed value or null if not found
   */
  read<T>(key: string): T | null {
    try {
      const jsonString = localStorage.getItem(key);
      if (jsonString === null) {
        return null;
      }
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`StorageService: Error reading key '${key}'`, error);
      return null;
    }
  }

  /**
   * Update an existing item in localStorage
   * @param key The key of the item to update
   * @param value The new value (will be JSON serialized)
   */
  update(key: string, value: any): void {
    try {
      if (!key || key.trim() === '') {
        console.error('StorageService: Key cannot be empty');
        return;
      }
      const jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
    } catch (error) {
      console.error('StorageService: Error updating item', error);
    }
  }

  /**
   * Delete an item from localStorage
   * @param key The key of the item to delete
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('StorageService: Error deleting item', error);
    }
  }

  /**
   * Get all items from localStorage
   * @returns An object with all key-value pairs, skipping any with parse errors
   */
  getAll(): Record<string, any> {
    try {
      const result: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              result[key] = JSON.parse(value);
            }
          } catch (parseError) {
            // Skip corrupted entries
            console.warn(`StorageService: Skipping corrupted entry for key '${key}'`);
          }
        }
      }
      return result;
    } catch (error) {
      console.error('StorageService: Error getting all items', error);
      return {};
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('StorageService: Error clearing storage', error);
    }
  }
}
