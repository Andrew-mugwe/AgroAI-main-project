import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MISSING_KEYS_KEY = 'i18n_missing_keys';
const BATCH_SIZE = 10;
const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes

interface MissingKey {
  key: string;
  namespace: string;
  language: string;
  timestamp: number;
  context?: string;
}

// Storage adapter for web/mobile
const storage = {
  async get(): Promise<MissingKey[]> {
    try {
      if (Platform.OS === 'web') {
        const data = localStorage.getItem(MISSING_KEYS_KEY);
        return data ? JSON.parse(data) : [];
      } else {
        const data = await AsyncStorage.getItem(MISSING_KEYS_KEY);
        return data ? JSON.parse(data) : [];
      }
    } catch {
      return [];
    }
  },

  async set(keys: MissingKey[]): Promise<void> {
    try {
      const data = JSON.stringify(keys);
      if (Platform.OS === 'web') {
        localStorage.setItem(MISSING_KEYS_KEY, data);
      } else {
        await AsyncStorage.setItem(MISSING_KEYS_KEY, data);
      }
    } catch (error) {
      console.error('Failed to save missing keys:', error);
    }
  },
};

// Queue for batching missing keys
let queue: MissingKey[] = [];
let syncTimeout: NodeJS.Timeout | null = null;

// Sync missing keys to storage
const syncToStorage = async () => {
  if (queue.length === 0) return;

  try {
    const existingKeys = await storage.get();
    const newKeys = [...existingKeys, ...queue];
    
    // Remove duplicates based on key + namespace + language
    const uniqueKeys = newKeys.filter((key, index, self) =>
      index === self.findIndex(k => 
        k.key === key.key && 
        k.namespace === key.namespace && 
        k.language === key.language
      )
    );

    // Keep only the latest 1000 missing keys
    const trimmedKeys = uniqueKeys.slice(-1000);
    
    await storage.set(trimmedKeys);
    queue = [];
  } catch (error) {
    console.error('Failed to sync missing keys:', error);
  }
};

// Schedule storage sync
const scheduleSyncToStorage = () => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(syncToStorage, SYNC_INTERVAL);
};

// Missing key handler for i18next
export const missingKeyHandler = (
  languages: readonly string[],
  namespace: string,
  key: string,
  fallbackValue: string
) => {
  const missingKey: MissingKey = {
    key,
    namespace,
    language: languages[0],
    timestamp: Date.now(),
    context: process.env.NODE_ENV === 'development' ? new Error().stack : undefined,
  };

  queue.push(missingKey);

  // Sync to storage if batch size reached
  if (queue.length >= BATCH_SIZE) {
    syncToStorage();
  } else {
    scheduleSyncToStorage();
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Missing translation: ${namespace}:${key} (${languages[0]})`);
  }

  return fallbackValue;
};

// Export missing keys for sync script
export const exportMissingKeys = async (): Promise<MissingKey[]> => {
  await syncToStorage(); // Ensure all queued keys are saved
  return storage.get();
};

// Clear missing keys (after successful sync)
export const clearMissingKeys = async (): Promise<void> => {
  queue = [];
  if (Platform.OS === 'web') {
    localStorage.removeItem(MISSING_KEYS_KEY);
  } else {
    await AsyncStorage.removeItem(MISSING_KEYS_KEY);
  }
};
