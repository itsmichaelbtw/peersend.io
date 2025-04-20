<script setup lang="ts">
import { websocketState } from "@/state/websocket";

import { useClsx } from "@/composables/use-clsx";

const { classNames, joinCls } = useClsx({
  container: {
    "bg-primary-50": websocketState.connection_type === "direct",
    "bg-gray-100": websocketState.connection_type === "signal"
  }
});
</script>

<template>
  <div v-bind:class="joinCls('rounded-md p-2.5 select-none', classNames.container)">
    <h4 class="mb-2 text-sm font-medium">Connection details</h4>
    <div class="space-y-1">
      <div class="flex justify-between">
        <span class="text-xs text-gray-500">Protocol</span>
        <span v-if="websocketState.connection_type === 'direct'" class="font-mono text-xs"
          >WebRTC</span
        >
        <span v-if="websocketState.connection_type === 'signal'" class="font-mono text-xs"
          >WebSocket</span
        >
      </div>
      <div v-if="websocketState.latency > -1" class="flex justify-between">
        <span class="text-xs text-gray-500">Latency</span>
        <span class="font-mono text-xs">{{ websocketState.latency }}ms</span>
      </div>
      <div class="flex justify-between">
        <span class="text-xs text-gray-500">Session code</span>
        <span class="font-mono text-xs">{{ websocketState.session_code }}</span>
      </div>
    </div>
  </div>
</template>
