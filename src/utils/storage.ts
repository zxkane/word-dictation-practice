/**
 * Gets a value from localStorage with type safety and default fallback
 * @param key The storage key to retrieve
 * @param defaultValue The default value to return if key doesn't exist
 * @returns The stored value or default value
 */
export function getStorageValue<T>(key: string, defaultValue: T): T {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    // Return default value if item doesn't exist
    if (item === null) {
      return defaultValue;
    }
    // Parse and return stored value
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

type StorageListener<T> = (newValue: T) => void;
const listeners: { [key: string]: StorageListener<any>[] } = {};

/**
 * Sets a value in localStorage with type safety
 * @param key The storage key to set
 * @param value The value to set
 */
export const setStorageValue = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Notify listeners when value changes
    if (listeners[key]) {
      listeners[key].forEach(listener => listener(value));
    }
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
};

export const addStorageListener = <T,>(key: string, listener: StorageListener<T>) => {
  if (!listeners[key]) {
    listeners[key] = [];
  }
  listeners[key].push(listener);

  // Return cleanup function
  return () => {
    listeners[key] = listeners[key].filter(l => l !== listener);
    if (listeners[key].length === 0) {
      delete listeners[key];
    }
  };
};

// Optional: Add window storage event listener for cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && listeners[e.key]) {
      const newValue = e.newValue ? JSON.parse(e.newValue) : null;
      listeners[e.key].forEach(listener => listener(newValue));
    }
  });
} 