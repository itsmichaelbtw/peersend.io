<script setup>
import SessionHeader from "@/components/header/SessionHeader.vue";

import { watch } from "vue";
import { websocketState } from "@/state/websocket";

import { useToast } from "primevue/usetoast";

const toast = useToast();

watch(
  () => websocketState.last_error,
  (newError) => {
    if (newError) {
      toast.add({
        severity: "error",
        life: 2500,
        detail: newError.data.message,
        summary: newError.type
      });
    }
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
