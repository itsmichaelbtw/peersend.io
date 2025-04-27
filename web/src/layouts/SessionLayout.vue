<script setup>
import SessionHeader from "@/components/header/SessionHeader.vue";

import { watch } from "vue";
import { applicationState, socketState, rtcState } from "@/state/application";

import { useToast } from "primevue/usetoast";

import { formatErrorTitle } from "@/utils/format-error-title";
import { capitalise } from "@/utils/capitalise";

const toast = useToast();

watch(
  () => applicationState.last_error,
  (newError) => {
    if (newError) {
      toast.add({
        severity: "error",
        life: 2500,
        detail: capitalise(newError.data.message),
        summary: formatErrorTitle(newError.type)
      });
    }
  }
);

watch(
  [() => socketState.is_connected, () => rtcState.is_connected],
  ([websocketConnected, rtcConnected]) => {
    applicationState.is_connected = websocketConnected || rtcConnected;
  }
);
</script>

<template>
  <SessionHeader />
  <main
    class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-8 not-sm:py-4 md:py-20 lg:py-28"
  >
    <router-view />
  </main>
</template>
