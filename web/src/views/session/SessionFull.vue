<script setup lang="ts">
import SessionDeck from "@/components/session/SessionDeck.vue";

import { onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { WifiOff } from "lucide-vue-next";

import { WebSocketClient } from "@/lib/websocket";
import { applicationState } from "@/state/application";

onUnmounted(() => {
  WebSocketClient.disconnect();
});
</script>

<template>
  <SessionDeck heading="Room Full" back-navigation="/session/create">
    <template #title>
      <div class="flex flex-row items-center">
        <WifiOff v-bind:size="24" class="text-red-500" />
        <span class="ml-2">Connection failed</span>
      </div>
    </template>
    <template #subtitle
      >This room is full ({{ applicationState.maximum_clients }}/{{
        applicationState.maximum_clients
      }})</template
    >
    <template #content>
      <div class="my-4 rounded bg-red-50 p-4 text-red-800">
        <p class="text-sm leading-normal">
          The session
          <span class="font-mono font-bold">{{ applicationState.session_code }}</span> is currently
          full. Each room can only support a maximum of
          {{ applicationState.maximum_clients }} concurrent connections.
        </p>
      </div>
    </template>

    <template #footer>
      <p class="mb-3 text-sm">You can try again later or create your own room.</p>
      <RouterLink to="/session/create">
        <Button size="small" fluid> Creation session </Button>
      </RouterLink>
    </template>
  </SessionDeck>
</template>
