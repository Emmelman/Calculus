import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the built web app (dist/) into a native Android APK.
// Install Capacitor and add the platform on a machine with the Android SDK
// (e.g. the tablet via Termux/Ubuntu) — see README "Сборка APK на планшете".
const config: CapacitorConfig = {
  appId: "com.umnozharium.app",
  appName: "Умножариум",
  webDir: "dist",
  android: {
    backgroundColor: "#3a2a8c",
  },
};

export default config;
