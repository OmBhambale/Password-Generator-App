import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (e) {
      return;
    }
  }
  return SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
      return;
    } catch (e) {
      return;
    }
  }
  return SecureStore.deleteItemAsync(key);
}
