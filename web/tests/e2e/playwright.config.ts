import { defineConfig, devices } from "@playwright/test";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const webRoot = path.resolve(__dirname, "../../");
const serverRoot = path.resolve(__dirname, "../../../server");

const remoteUrl = process.env.PLAYWRIGHT_BASE_URL;

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
    baseURL: remoteUrl ?? "http://localhost:3501",
    trace: "on-first-retry",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },
  // Only spawn local servers when not targeting a remote environment.
  // When PLAYWRIGHT_BASE_URL is set, the servers are already running remotely.
  webServer: remoteUrl ? undefined : [
    {
      command: "go run ./cmd/testserver/main.go",
      url: "http://localhost:8081/health",
      cwd: serverRoot,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --port 3501",
      url: "http://localhost:3501",
      cwd: webRoot,
      env: {
        VITE_SERVER_ENDPOINT: "ws://localhost:8081/exchange",
        VITE_SESSION_CODE_EXAMPLE: "X-4FGS6H",
        VITE_LOG_LEVEL: "debug",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
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
