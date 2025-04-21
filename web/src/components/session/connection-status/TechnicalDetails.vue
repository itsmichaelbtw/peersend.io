<script setup lang="ts">
import { applicationState } from "@/state/application";

import { useClsx } from "@/composables/use-clsx";

const { classNames, joinCls } = useClsx({
  container: {
    "bg-primary-50": applicationState.connection_type === "webrtc",
    "bg-gray-100": applicationState.connection_type === "websocket"
  }
});
</script>

<template>
  <div v-bind:class="joinCls('rounded-md p-2.5 select-none', classNames.container)">
    <h4 class="mb-2 text-sm font-medium">Technical details</h4>
    <div class="space-y-1">
      <div class="flex justify-between">
        <span class="text-xs text-gray-500">Protocol</span>
        <span v-if="applicationState.connection_type === 'webrtc'" class="font-mono text-xs"
          >WebRTC</span
        >
        <span v-if="applicationState.connection_type === 'websocket'" class="font-mono text-xs"
          >WebSocket</span
        >
      </div>
      <div v-if="applicationState.latency > -1" class="flex justify-between">
        <span class="text-xs text-gray-500">Latency</span>
        <span class="font-mono text-xs">{{ applicationState.latency }}ms</span>
      </div>
      <div class="flex justify-between">
        <span class="text-xs text-gray-500">Session code</span>
        <span class="font-mono text-xs">{{ applicationState.session_code }}</span>
      </div>
    </div>
  </div>
</template>
