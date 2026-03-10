import { defineConfig } from "@playwright/test";

export default defineConfig({
  tsconfig: "./tsconfig.json",
  outputDir: "./test-results",
  testDir: "./unit",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: 4,
  reporter: [["list"]],
  projects: [
    {
      name: "unit",
      use: {},
    },
  ],
});
