<script setup lang="ts">
import SessionDeck from "@/components/session/SessionDeck.vue";

import { onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { WifiOff } from "lucide-vue-next";

import { WebSocketSingleton } from "@/lib/websocket";
import { websocketState } from "@/state/websocket";

onUnmounted(() => {
  WebSocketSingleton.disconnect();
});
</script>

<template>
  <SessionDeck heading="Room Full" back-navigation="/session/create">
    <template #title>
      <div class="flex flex-row items-center">
        <WifiOff :size="24" class="text-red-500" />
        <span class="ml-2">Connection failed</span>
      </div>
    </template>
    <template #subtitle
      >This room is full ({{ websocketState.maximum_clients }}/{{
        websocketState.maximum_clients
      }})</template
    >
    <template #content>
      <div class="my-4 rounded bg-red-50 p-4 text-red-800">
        <p class="text-sm leading-normal">
          The session <span class="font-mono font-bold">{{ websocketState.session_code }}</span> is
          currently full. Each room can only support a maximum of
          {{ websocketState.maximum_clients }} concurrent connections.
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
