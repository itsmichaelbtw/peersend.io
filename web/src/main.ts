import "./assets/css/tailwindcss.css";
import "./assets/css/fonts.css";

import { createApp } from "vue";
import { router } from "./router";

import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

import StyleClass from "primevue/styleclass";

import PeerSend from "./PeerSend.vue";

const app = createApp(PeerSend);

app
  .use(router)
  .use(ToastService)
  .use(ConfirmationService)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: ".p-dark"
      }
    }
  })
  .directive("tooltip", Tooltip)
  .directive("styleclass", StyleClass)
  .mount("#app");
