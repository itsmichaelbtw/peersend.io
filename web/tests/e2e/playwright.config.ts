import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  outputDir: "../test-results",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    trace: "on-first-retry",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
