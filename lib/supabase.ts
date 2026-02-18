import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Safe storage adapter that works during SSR (static rendering).
 * During Node.js static rendering, `window` is not defined, so
 * AsyncStorage (which depends on window for web) will crash.
 * This adapter defers the AsyncStorage import and provides a
 * no-op fallback when running in a non-browser environment.
 */
const createSafeStorage = () => {
  // Check if we're in a browser or native environment (not SSR)
  const isBrowser = typeof window !== 'undefined';
  const isNative = Platform.OS !== 'web';

  if (isBrowser || isNative) {
    // Safe to use AsyncStorage
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }

  // SSR / Node.js fallback — return a no-op storage
  return {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, _value: string) => Promise.resolve(),
    removeItem: (_key: string) => Promise.resolve(),
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
