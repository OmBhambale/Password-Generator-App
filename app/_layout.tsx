import { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getItem, setItem } from '../lib/secureStore';
import { supabase } from '../lib/supabase';
import AuthScreen from './AuthScreen'; // We will create this next
import "./globals.css";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // 1. Ensure Master Key exists for encryption
      let key = await getItem('master_key');
      if (!key) {
        const newKey = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        await setItem('master_key', newKey);
      }

      // 2. Check Session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setInitialized(true);
    };

    prepare();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (!initialized) return null;
  if (!session) return <AuthScreen />;
  return <Stack>
      <Stack.Screen
          name="(tabs)"
          options={{
            title: 'QuickCrypt',
            headerShown: false
          }}
      />
  </Stack>;
}
