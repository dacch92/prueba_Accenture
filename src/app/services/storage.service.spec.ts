import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should create and retrieve data with type preservation', () => {
    const testData = { name: 'test', value: 123, active: true };
    service.create('testKey', testData);
    const result = service.read('testKey');
    expect(result).toEqual(testData);
  });

  it('should return null for non-existent key', () => {
    const result = service.read('nonexistent');
    expect(result).toBeNull();
  });

  it('should update existing data', () => {
    const initialData = { v: 1 };
    const updatedData = { v: 2 };
    
    service.create('key', initialData);
    const readBefore = service.read('key');
    expect(readBefore).toEqual(initialData);
    
    service.update('key', updatedData);
    const readAfter = service.read('key');
    expect(readAfter).toEqual(updatedData);
  });

  it('should delete data by key', () => {
    const testData = { data: 'test' };
    service.create('key', testData);
    
    // Verify it exists
    let result = service.read('key');
    expect(result).toEqual(testData);
    
    // Delete it
    service.delete('key');
    
    // Verify it's gone
    result = service.read('key');
    expect(result).toBeNull();
  });

  it('should get all stored data', () => {
    const data1 = { a: 1 };
    const data2 = { b: 2 };
    const data3 = { c: 3 };
    
    service.create('key1', data1);
    service.create('key2', data2);
    service.create('key3', data3);
    
    const allData = service.getAll();
    expect(allData).toEqual({
      key1: data1,
      key2: data2,
      key3: data3
    });
  });

  it('should clear all storage', () => {
    const data1 = { a: 1 };
    const data2 = { b: 2 };
    
    service.create('key1', data1);
    service.create('key2', data2);
    
    // Verify data exists
    let allData = service.getAll();
    expect(Object.keys(allData).length).toBe(2);
    
    // Clear storage
    service.clear();
    
    // Verify all is cleared
    allData = service.getAll();
    expect(allData).toEqual({});
  });

  it('should handle JSON parse errors gracefully', () => {
    // Manually set corrupted JSON in localStorage
    localStorage.setItem('corrupt', '{invalid');
    
    // Should return null and log error, but not throw
    const result = service.read('corrupt');
    expect(result).toBeNull();
  });

  it('should skip corrupted entries in getAll()', () => {
    const validData = { valid: true };
    
    service.create('validKey', validData);
    localStorage.setItem('corruptKey', '{invalid');
    
    const allData = service.getAll();
    
    // Should have the valid entry but skip the corrupted one
    expect(allData['validKey']).toEqual(validData);
    expect(allData['corruptKey']).toBeUndefined();
  });

  it('should handle empty key on create', () => {
    // Should handle gracefully (log error but not throw)
    service.create('', { data: 'test' });
    service.create('   ', { data: 'test' });
    
    // Verify nothing was stored
    const result1 = service.read('');
    const result2 = service.read('   ');
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should store and retrieve complex objects', () => {
    const complexData = {
      user: {
        name: 'John',
        age: 30,
        tags: ['admin', 'user']
      },
      metadata: {
        created: '2024-01-01',
        count: 42
      }
    };
    
    service.create('complexKey', complexData);
    const result = service.read('complexKey');
    expect(result).toEqual(complexData);
  });

  it('should store and retrieve arrays', () => {
    const arrayData = [1, 2, 3, { nested: 'value' }, 'string'];
    
    service.create('arrayKey', arrayData);
    const result = service.read<typeof arrayData>('arrayKey');
    expect(result).toEqual(arrayData);
  });
});
