import { defineConfig } from "vite";
import { PrimeVueResolver } from "unplugin-vue-components/resolvers";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";

import Components from "unplugin-vue-components/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss(), tsconfigPaths(), Components({ resolvers: [PrimeVueResolver()] })]
});
