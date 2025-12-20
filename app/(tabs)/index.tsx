import React, { useState } from 'react';
import { Alert, Clipboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme'; // Using your Trust & Professional palette

export default function QuickCrypt() {
  const [password, setPassword] = useState('********');
  const insets = useSafeAreaInsets();

  const generatePassword = () => {
    const passwordLength = 12; // Standard professional length
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    // Combine everything for maximum security
    const allowedChars = lowerCaseChars + upperCaseChars + numbers + symbols;
    
    let newPassword = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      newPassword += allowedChars[randomIndex];
    }

    setPassword(newPassword);
  };

  const copyToClipboard = () => {
    if (password === '********') return;
    Clipboard.setString(password);
    Alert.alert("Copied!", "Password saved to clipboard.");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>QuickCrypt</Text>
      
      <View style={styles.card} className='mt-4'>
        <Text style={styles.label}>Your Secure Key</Text>
        <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.7}>
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordDisplay}>{password}</Text>
          </View>
          <Text style={styles.label} className='mt-4'>Tap password to copy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={generatePassword}>
        <Text style={styles.buttonText}>GENERATE PASSWORD</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... styles remain the same as previous Trust & Professional version

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 40,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 50,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Professional shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  passwordContainer: {
    backgroundColor: '#F1F4F6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  passwordDisplay: {
    fontSize: 22,
    fontFamily: 'monospace',
    color: Colors.primary,
    letterSpacing: 2,
  },
  button: {
    width: '100%',
    marginTop: 'auto', // Pushes button to the bottom area
    marginBottom: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  }
});