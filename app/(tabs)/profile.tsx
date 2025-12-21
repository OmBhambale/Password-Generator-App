import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { copyToClipboard } from '../../lib/clipboard';
import { getItem, setItem } from '../../lib/secureStore';
import { supabase } from '../../lib/supabase';
import { testServerVault } from '../../lib/sync';
import { Colors } from '../../lib/theme';

interface SettingItemProps {
  icon: keyof typeof import('@expo/vector-icons/Feather').default.glyphMap;
  title: string;
  color?: string;
  onPress?: () => void;
}
export default function Profile() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // User Data State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || '');
        
        // 1. Try to get name from Auth Metadata first (fastest)
        const metaName = user.user_metadata?.full_name;
        
        // 2. Cross-check with Public Profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (data) {
          setFullName(data.full_name || metaName || '');
        } else {
          setFullName(metaName || '');
        }
      }
    } catch (e: any) {
      console.error('Error fetching profile:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    // Prevent empty updates
    if (!fullName.trim()) return;
    
    setUpdating(true);
    try {
      // 1. Sync to Supabase Auth (Reflects in Auth User dashboard)
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (authError) throw authError;

      // 2. Sync to Public Profiles Table (For DB queries/Vault)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user?.id,
          full_name: fullName,
          updated_at: new Date(),
        });
      if (profileError) throw profileError;

      Alert.alert("Success", "Profile updated everywhere.");
    } catch (error: any) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setUpdating(false);
      setIsEditing(false);
    }
  };

  const SettingItem = ({ icon, title, color = Colors.primary, onPress }: SettingItemProps) => (
  <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={styles.itemText}>{title}</Text>
    </View>
    <Feather name="chevron-right" size={20} color={Colors.accent} />
  </TouchableOpacity>
);

  const verifyServerVault = async () => {
    try {
      const masterKey = await getItem('master_key');
      if (!masterKey) return Alert.alert('No Master Key', 'No local master key found. Export/import a key first.');
      const { total, success, fail } = await testServerVault(masterKey);
      Alert.alert('Server Vault Check', `${success} / ${total} entries decryptable. ${fail} failed.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unknown error');
    }
  };

  const exportMasterKey = async () => {
    try {
      const masterKey = await getItem('master_key');
      if (!masterKey) return Alert.alert('No Master Key', 'No local master key found to export.');

      // copy to clipboard (web and native)
      try {
        await copyToClipboard(masterKey);
      } catch (_) {
        // ignore
      }

      Alert.alert('Exported', 'Master key copied to clipboard. Paste it on your other device to import.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not export key');
    }
  };

  const confirmImportKey = async () => {
    if (!importKey.trim()) return Alert.alert('Invalid', 'Paste a valid master key to import.');
    try {
      await setItem('master_key', importKey.trim());
      setShowImportModal(false);
      setImportKey('');
      Alert.alert('Imported', 'Master key saved. Run "Verify Server Vault" to check compatibility.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save key');
    }
  };

  const onSyncPress = () => {
    if (Platform.OS === 'web') {
      setShowSyncOptions(true);
      return;
    }

    Alert.alert('Sync Vault', 'Choose an action', [
      { text: 'Verify Server Vault', onPress: verifyServerVault },
      { text: 'Export Master Key', onPress: exportMasterKey },
      { text: 'Import Master Key', onPress: () => setShowImportModal(true) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.nameInputWrapper}>
            <TextInput 
              style={[styles.userNameInput, isEditing && styles.inputActive]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Set Full Name"
              onFocus={() => setIsEditing(true)}
              onBlur={handleUpdateName}
              placeholderTextColor={Colors.accent}
            />
            {updating ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{marginLeft: 8}} />
            ) : (
              <Feather 
                name={isEditing ? "check" : "edit-2"} 
                size={16} 
                color={isEditing ? "#34C759" : Colors.accent} 
                style={{marginLeft: 8}}
              />
            )}
          </View>
          
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* --- Options Section (Your Professional Layout) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <SettingItem icon="lock" title="Change Password" />
          <SettingItem icon="shield" title="Two-Factor Auth" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <SettingItem icon="database" title="Sync Vault Data" onPress={onSyncPress} />
          <SettingItem icon="info" title="QuickCrypt v1.0.0" />
        </View>

        <Modal visible={showImportModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: '#FFF', padding: 20, borderRadius: 12 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 10 }}>Import Master Key</Text>
              <TextInput
                value={importKey}
                onChangeText={setImportKey}
                placeholder="Paste master key here"
                style={{ borderWidth: 1, borderColor: '#EEE', padding: 10, borderRadius: 8, marginBottom: 12 }}
                multiline
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setShowImportModal(false)} style={{ marginRight: 12 }}>
                  <Text style={{ color: Colors.accent }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmImportKey}>
                  <Text style={{ color: Colors.primary, fontWeight: '700' }}>Import</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showSyncOptions} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: '#FFF', padding: 18, borderRadius: 12 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Sync Vault</Text>
              <TouchableOpacity style={{ paddingVertical: 12 }} onPress={async () => { setShowSyncOptions(false); await verifyServerVault(); }}>
                <Text style={{ color: Colors.primary }}>Verify Server Vault</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingVertical: 12 }} onPress={async () => { setShowSyncOptions(false); await exportMasterKey(); }}>
                <Text style={{ color: Colors.primary }}>Export Master Key</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingVertical: 12 }} onPress={() => { setShowSyncOptions(false); setShowImportModal(true); }}>
                <Text style={{ color: Colors.primary }}>Import Master Key</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingVertical: 12 }} onPress={() => setShowSyncOptions(false)}>
                <Text style={{ color: Colors.accent }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* --- Logout Section --- */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => Alert.alert(
            "Logout", 
            "Are you sure you want to log out?",
            [{ text: "Cancel", style: "cancel" }, { text: "Logout", onPress: () => supabase.auth.signOut(), style: 'destructive' }]
          )}
        >
          <Feather name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 40 },
  avatar: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, elevation: 5, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10
  },
  avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  
  // Name Input Styles
  nameInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  userNameInput: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: Colors.primary, 
    textAlign: 'center',
    paddingVertical: 5,
    minWidth: 100
  },
  inputActive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  userEmail: { fontSize: 14, color: Colors.accent, marginTop: 4 },
  
  // Section Styles
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.accent, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  item: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: Colors.surface, padding: 16, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  
  // Logout Styles
  logoutButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#FF3B30',
    marginTop: 10, marginBottom: 40
  },
  logoutText: { color: '#FF3B30', fontWeight: '700', fontSize: 16, marginLeft: 10 },
});