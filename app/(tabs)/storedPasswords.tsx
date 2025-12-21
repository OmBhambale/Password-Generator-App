import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as CryptoES from 'crypto-es';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getItem } from '../../lib/secureStore';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/theme';

interface PasswordItem {
  id: string;
  site_name: string;
  encrypted_value: string;
  pass: string;
  visible: boolean;
}

export default function StoredPasswords() {
  const [items, setItems] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchVault();
    }
  }, [isFocused]);

  const fetchVault = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('passwords').select('*');
      if (error) throw error;

      const masterKey = await getItem('master_key');
      if (!masterKey) throw new Error("Encryption key missing");

      const decrypted = (data || []).map((item: any) => {
        try {
          // 1. Decrypt the value
          const bytes = CryptoES.AES.decrypt(item.encrypted_value, masterKey);
          
          // 2. STABLE FIX: Use the toString() method with the explicit 'Utf8' string 
          // or the encoder directly from the main object
          // @ts-ignore
          const decryptedText = bytes.toString(CryptoES.Utf8 || CryptoES.enc.Utf8);

          // 3. If the result is empty, it's likely a key mismatch
          if (!decryptedText) {
             return { ...item, pass: "Wrong Key/Old Data", visible: false };
          }

          return { 
            ...item, 
            pass: decryptedText, 
            visible: false 
          };
        } catch (e) { 
          console.error("Decryption Logic Error:", e);
          return { ...item, pass: "Decryption Failed", visible: false }; 
        }
      });
      setItems(decrypted);
    } catch (e: any) { 
      Alert.alert("Vault Error", e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggle = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Vault</Text>
        <TouchableOpacity onPress={fetchVault}>
          <Feather name="refresh-cw" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.site_name}</Text>
                <Text style={styles.passText}>{item.visible ? item.pass : '••••••••'}</Text>
              </View>
              <TouchableOpacity onPress={() => toggle(item.id)}>
                <Feather name={item.visible ? "eye-off" : "eye"} size={24} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  item: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  name: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  passText: { fontFamily: 'monospace', color: Colors.accent, marginTop: 4 }
});