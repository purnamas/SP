import { JournalEntry, TeacherInfo, SchoolInfo } from '../types';

const DB_NAME = 'JurnalGuruDB';
const DB_VERSION = 2; // Incremented version for schema change
const ENTRIES_STORE = 'journalEntries';
const INFO_STORE = 'teacherInfo';
const SCHOOL_INFO_STORE = 'schoolInfo';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(ENTRIES_STORE)) {
        dbInstance.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(INFO_STORE)) {
        dbInstance.createObjectStore(INFO_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(SCHOOL_INFO_STORE)) {
        dbInstance.createObjectStore(SCHOOL_INFO_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const getEntries = async (): Promise<JournalEntry[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readonly');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.getAll();

    request.onerror = () => reject('Error fetching entries');
    request.onsuccess = () => resolve(request.result);
  });
};

export const addEntry = async (entry: JournalEntry): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.put(entry);

    request.onerror = () => reject('Error adding entry');
    request.onsuccess = () => resolve();
  });
};

export const updateEntry = async (entry: JournalEntry): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.put(entry);

    request.onerror = () => reject('Error updating entry');
    request.onsuccess = () => resolve();
  });
};


export const deleteEntry = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.delete(id);

    request.onerror = () => reject('Error deleting entry');
    request.onsuccess = () => resolve();
  });
};

export const deleteMultipleEntries = async (ids: string[]): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
        const store = transaction.objectStore(ENTRIES_STORE);
        
        ids.forEach(id => {
            store.delete(id);
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(`Error deleting multiple entries: ${(event.target as IDBRequest).error}`);
    });
};

export const getTeacherInfo = async (): Promise<TeacherInfo | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INFO_STORE, 'readonly');
    const store = transaction.objectStore(INFO_STORE);
    const request = store.get('default'); // Use a fixed key for single-item store

    request.onerror = () => reject('Error fetching teacher info');
    request.onsuccess = () => resolve(request.result ? request.result.data : null);
  });
};

export const saveTeacherInfo = async (info: TeacherInfo): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INFO_STORE, 'readwrite');
    const store = transaction.objectStore(INFO_STORE);
    // Use a fixed key 'default' to always overwrite the same record
    const request = store.put({ id: 'default', data: info });

    request.onerror = () => reject('Error saving teacher info');
    request.onsuccess = () => resolve();
  });
};

export const getSchoolInfo = async (): Promise<SchoolInfo | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SCHOOL_INFO_STORE, 'readonly');
      const store = transaction.objectStore(SCHOOL_INFO_STORE);
      const request = store.get('default');
  
      request.onerror = () => reject('Error fetching school info');
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
    });
  };
  
  export const saveSchoolInfo = async (info: SchoolInfo): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SCHOOL_INFO_STORE, 'readwrite');
      const store = transaction.objectStore(SCHOOL_INFO_STORE);
      const request = store.put({ id: 'default', data: info });
  
      request.onerror = () => reject('Error saving school info');
      request.onsuccess = () => resolve();
    });
  };

export const clearAllData = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([ENTRIES_STORE, INFO_STORE, SCHOOL_INFO_STORE], 'readwrite');
        transaction.onerror = () => reject('Error clearing data');
        transaction.oncomplete = () => resolve();

        transaction.objectStore(ENTRIES_STORE).clear();
        transaction.objectStore(INFO_STORE).clear();
        transaction.objectStore(SCHOOL_INFO_STORE).clear();
    });
}