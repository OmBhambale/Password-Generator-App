import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
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
