import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tunemyfart.app",
  appName: "TuneMyFart",
  webDir: "dist",
  ios: {
    contentInset: "always",
    scrollEnabled: false,
    backgroundColor: "#F2ECE0",
    splashScreenDelay: 1500,
    scheme: "tunemyfart",
  },
  android: {
    allowMixedContent: true,
    androidScheme: "tunemyfart",
    backgroundColor: "#F2ECE0",
  },
  plugins: {
    App: {
      launchShowDuration: 0,
    },
  },
};

export default config;
