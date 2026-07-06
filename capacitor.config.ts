import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tunemyfart.app",
  appName: "Tunemyfart",
  webDir: "dist",
  ios: {
    contentInset: "always",
    scrollEnabled: false,
    backgroundColor: "#F2ECE0",
    splashScreenDelay: 1500,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
