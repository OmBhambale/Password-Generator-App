import * as CryptoES from 'crypto-es';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { copyToClipboard } from '../../lib/clipboard';
import { getItem } from '../../lib/secureStore';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/theme';

export default function QuickCrypt() {
  const [password, setPassword] = useState('********');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [siteLabel, setSiteLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0; i < 14; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(retVal);
  };

  const handleSaveToVault = async () => {
    if (!siteLabel.trim()) return Alert.alert("Error", "Enter a label");
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const masterKey = await getItem('master_key');
      
      if (!masterKey) throw new Error("Key error");

      // ENCRYPTION
      const encrypted = CryptoES.AES.encrypt(password, masterKey).toString();

      const { error } = await supabase.from('passwords').insert([{ 
        user_id: user?.id, 
        site_name: siteLabel, 
        encrypted_value: encrypted 
      }]);

      if (error) throw error;
      Alert.alert("Success", "Password encrypted and saved!");
      setIsModalVisible(false);
      setSiteLabel('');
    } catch (e: any) {
      Alert.alert("Failed", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>QuickCrypt</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Generated Key</Text>
        <TouchableOpacity onPress={() => password !== '********' && copyToClipboard(password)}>
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordDisplay}>{password}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.button} onPress={generatePassword}>
          <Text style={styles.buttonText}>GENERATE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors.secondary, marginTop: 10 }]} 
          onPress={() => password !== '********' && setIsModalVisible(true)}
        >
          <Text style={styles.buttonText}>SAVE TO VAULT</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Label this password</Text>
            <TextInput style={styles.input} placeholder="e.g. Instagram" onChangeText={setSiteLabel} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToVault}>
               {isSaving ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>CONFIRM SAVE</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}><Text style={{textAlign: 'center', marginTop: 10, color: Colors.accent}}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFF', padding: 25, borderRadius: 20, marginTop: 40, elevation: 5 },
  label: { fontSize: 12, color: Colors.accent, fontWeight: '700', textAlign: 'center' },
  passwordContainer: { backgroundColor: '#F1F4F6', padding: 15, borderRadius: 12, marginTop: 10 },
  passwordDisplay: { fontSize: 20, textAlign: 'center', fontFamily: 'monospace', color: Colors.primary },
  bottomActions: { marginTop: 'auto', marginBottom: 20 },
  button: { backgroundColor: Colors.primary, padding: 20, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 10, marginBottom: 20 },
  saveBtn: { backgroundColor: Colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' }
});