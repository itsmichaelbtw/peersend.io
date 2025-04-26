import { ref, onMounted } from "vue";
import { checkWebRTCCompatibility } from "@/utils/compatibility";

import { UAParser } from "ua-parser-js";

export function useCompatibility() {
  const isCompatible = ref(true);
  const isChecking = ref(true);
  const browser = ref();

  onMounted(() => {
    const parser = new UAParser();

    isCompatible.value = checkWebRTCCompatibility();
    browser.value = parser.getBrowser().name || "unknown";
    isChecking.value = false;
  });

  return {
    isCompatible: isCompatible,
    isChecking: isChecking,
    browser: browser
  };
}
