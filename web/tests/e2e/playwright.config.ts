import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

export default defineConfig({
  testDir: "./",
  outputDir: "../test-results",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: false,
  forbidOnly: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 30_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3500",
    trace: "on-first-retry",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--allow-insecure-localhost"]
        }
      },
      testIgnore: ["**/browser/firefox.spec.ts"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "media.peerconnection.enabled": true,
            "media.peerconnection.ice.loopback": true
          }
        }
      },
      testIgnore: ["**/browser/chromium.spec.ts"],
    },
  ],
});
