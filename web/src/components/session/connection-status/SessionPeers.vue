<script setup lang="ts">
import { websocketState } from "@/state/websocket";

import { UsersRound } from "lucide-vue-next";
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex flex-row items-center gap-x-1">
        <UsersRound v-bind:size="16" />
        <span class="text-sm font-normal">Peers</span>
      </div>
      <span class="text-sm font-light">
        {{ websocketState.clients.length }}/{{ websocketState.maximum_clients }}
      </span>
    </div>
    <ProgressBar
      v-bind:value="(websocketState.clients.length * 100) / 2"
      v-bind:show-value="false"
      style="height: 8px"
    />
  </div>
</template>
