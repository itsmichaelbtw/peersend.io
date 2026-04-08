import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error Missing type declarations
import eslint from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	publicDir: "public",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	plugins: [
		react(),
		tailwindcss(),
		tsconfigPaths(),
		svgr(),
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
