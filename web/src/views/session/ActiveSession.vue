<script setup lang="ts">
import CopyToClipboard from "@/components/CopyToClipboard.vue";
import ActivityLog from "@/components/session/ActivityLog.vue";

import ConnectionStatus from "@/components/session/connection-status/ConnectionStatus.vue";
import FileTransfer from "@/components/session/files/FileTransfer.vue";

import { websocketState } from "@/state/websocket";
import { sleep } from "@/utils/sleep";

import { Crown, Copy, Wifi, Router, TriangleAlert } from "lucide-vue-next";

function transferHost() {
  // sleep(500).then(() => {
  //   websocketState.is_host = false;
  // });
}
</script>

<template>
  <Message severity="warn" class="w-full select-none">
    <template #icon>
      <TriangleAlert v-bind:size="20" />
    </template>
    <span class="font-light">
      All received files will be lost when you close this tab or browser. Download any files you
      want to keep.
    </span></Message
  >

  <div
    v-if="websocketState.is_connected"
    class="relative flex w-full items-center justify-between select-none"
  >
    <div class="flex items-center justify-between gap-x-2">
      <CopyToClipboard
        v-if="websocketState.session_code"
        v-bind:value="websocketState.session_code"
      >
        <Button variant="text" severity="contrast" class="text-gray-500 hover:bg-gray-100!">
          <span class="font-mono text-base">{{ websocketState.session_code }}</span>
          <Copy v-bind:size="18" class="ml-2" />
        </Button>
      </CopyToClipboard>

      <Badge v-if="websocketState.connection_type === 'signal'" severity="secondary">
        <Wifi v-bind:size="14" />
        <span class="ml-2 font-medium">Server Connection</span>
      </Badge>
      <Badge v-if="websocketState.connection_type === 'direct'" severity="success">
        <Router v-bind:size="14" />
        <span class="ml-2 font-medium">Direct Connection</span>
      </Badge>
    </div>

    <Button
      v-if="websocketState.is_host"
      v-on:click="transferHost"
      severity="contrast"
      size="small"
    >
      <Crown v-bind:size="18" />
      Transfer host
    </Button>
  </div>

  <div class="grid w-full grid-cols-3 gap-4">
    <div class="col-span-1 space-y-4">
      <ConnectionStatus />
      <ActivityLog v-bind:logs="[]" />
    </div>

    <div class="col-span-2">
      <FileTransfer />
    </div>
  </div>
</template>
