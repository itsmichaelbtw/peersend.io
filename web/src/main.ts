import "./assets/css/tailwindcss.css";

import { createApp } from "vue";
import { router } from "./router";

import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";

import StyleClass from "primevue/styleclass";

import PeerSend from "./PeerSend.vue";
import { definePreset } from "@primeuix/themes";

const theme = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{blue.50}",
      100: "{blue.100}",
      200: "{blue.200}",
      300: "{blue.300}",
      400: "{blue.400}",
      500: "{blue.500}",
      600: "{blue.600}",
      700: "{blue.700}",
      800: "{blue.800}",
      900: "{blue.900}",
      950: "{blue.950}"
    }
  }
});

const app = createApp(PeerSend);

app
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: theme,
      options: {
        darkModeSelector: ".p-dark"
      }
    }
  })
  .directive("styleclass", StyleClass)
  .mount("#app");
