import "./assets/css/tailwindcss.css";

import { createApp } from "vue";
import { router } from "./router";

import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import Button from "primevue/button";

import StyleClass from "primevue/styleclass";

import PeerSend from "./PeerSend.vue";

const app = createApp(PeerSend);

app
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: ".p-dark"
      }
    }
  })
  .component("Button", Button)
  .directive("styleclass", StyleClass)
  .mount("#app");
