# QuickCrypt 🛡️

QuickCrypt is a secure, cross-platform password generator and vault built with **React Native** and **Expo**. It prioritizes privacy by using a zero-knowledge architecture where passwords are encrypted locally before ever touching the cloud.

## Key Features

- **🎲 Secure Generation**: Instantly generate strong, 14-character passwords with a mix of alphanumeric characters and symbols.
- **🔐 Zero-Knowledge Vault**: Your passwords are encrypted using **AES-256** on your device. Only you hold the key.
- **☁️ Cloud Sync**: Seamlessly sync your encrypted vault across devices using **Supabase**.
- **🔑 Local Master Key**: A unique device-specific master key is generated and stored in the OS-level secure enclave (Keychain/Keystore) via `expo-secure-store`.
- **🌓 Adaptive UI**: Professional design with support for system-wide light and dark modes.

## How It Works

### 1. Security Architecture
QuickCrypt follows a strict client-side encryption flow:
- **Master Key**: When you first open the app, it generates a cryptographically secure random string that stays on your device.
- **Encryption**: When you save a password, the app uses `crypto-es` to perform AES encryption using your local Master Key.
- **Transport**: Only the *encrypted* string (ciphertext) and the site label are sent to the Supabase database.
- **Decryption**: When viewing your vault, the app fetches the ciphertext and decrypts it in real-time using your local key.

### 2. Tech Stack
- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Backend**: [Supabase](https://supabase.com/) (Authentication & PostgreSQL)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Encryption**: [Crypto-ES](https://github.com/entronad/crypto-es)
- **Storage**: [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/secure-store/)

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- Expo Go app on your mobile device or an emulator

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PasswordGeneratorApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

- `app/`: Contains the main screens and layout logic (Expo Router).
- `app/(tabs)/`: Main application features (Generator, Vault, Profile).
- `lib/`: Utility functions for encryption, Supabase client, and secure storage.
- `assets/`: Icons and splash screen images.

## Security Note
This app uses a device-specific Master Key. If you uninstall the app or clear its data without backing up your key (or if the device is lost), the stored passwords in the cloud will be unrecoverable because they were encrypted with that specific key.
