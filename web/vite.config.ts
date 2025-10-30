import path, { dirname } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error Missing type declarations
import eslint from "vite-plugin-eslint";

import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	plugins: [
		react(),
		tailwindcss(),
		tsconfigPaths(),
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		eslint({
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["node_modules", "dist"],
			cache: false,
			failOnError: false,
			failOnWarning: false
		})
	]
});
