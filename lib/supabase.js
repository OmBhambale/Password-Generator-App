import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_API_KEY;

let storage;
if (typeof window !== 'undefined') {
  try {
    // require dynamically to avoid importing AsyncStorage during SSR/node startup
    // which can reference `window` and crash the server process.
    // eslint-disable-next-line global-require
    storage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    storage = undefined;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});