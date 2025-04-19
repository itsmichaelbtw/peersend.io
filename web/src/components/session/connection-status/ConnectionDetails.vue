<script setup lang="ts">
import { websocketState } from "@/state/websocket";
</script>

<template>
  <div className="rounded-md bg-gray-100 p-3 select-none">
    <h4 className="mb-2 text-sm font-medium">Connection details</h4>
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">Protocol</span>
        <span v-if="websocketState.connection_type === 'direct'" className="text-xs font-mono"
          >WebRTC</span
        >
        <span v-if="websocketState.connection_type === 'signal'" className="text-xs font-mono"
          >WebSocket</span
        >
      </div>
      <div v-if="websocketState.latency > 0" className="flex justify-between">
        <span className="text-xs text-gray-500">Latency</span>
        <span className="text-xs font-mono">{{ websocketState.latency }}ms</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">Session code</span>
        <span className="text-xs font-mono">{{ websocketState.session_code }}</span>
      </div>
    </div>
  </div>
</template>
