<script setup lang="ts">
import CopyToClipboard from "@/components/CopyToClipboard.vue";
import ActivityLog from "@/components/session/ActivityLog.vue";

import ConnectionStatus from "@/components/session/connection-status/ConnectionStatus.vue";
import WaitingForHost from "@/components/session/connection-state/WaitingForHost.vue";
import DirectConnectionPrompt from "@/components/session/connection-state/DirectConnectionPrompt.vue";
import FileTransfer from "@/components/session/file-transfer/FileTransfer.vue";
import WaitingForConnections from "@/components/session/connection-state/WaitingForConnections.vue";
import DeveloperControls from "@/components/session/DeveloperControls.vue";
import UpgradeDialog from "@/components/session/upgrade-dialog/Dialog.vue";

import { applicationState } from "@/state/application";
import { dialogState } from "@/state/dialog";
import { WebSocketClient } from "@/lib/websocket";
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";

import { Crown, Copy, Wifi, Router, TriangleAlert } from "lucide-vue-next";

const router = useRouter();

onBeforeMount(() => {
  if (applicationState.connection_type === "none") {
    router.push("/session/create");
  }
});
</script>

<template>
  <UpgradeDialog
    v-bind:visible="dialogState.upgradeDialogVisible"
    v-bind:onChange="(visible: boolean) => (dialogState.upgradeDialogVisible = visible)"
  />
  <template v-if="applicationState.is_connected && applicationState.connection_type != 'none'">
    <Message severity="warn" class="w-full select-none">
      <template #icon>
        <TriangleAlert v-bind:size="20" />
      </template>
      <span class="font-light">
        All received files will be lost when you close this tab or browser. Download any files you
        want to keep.
      </span></Message
    >

    <DeveloperControls />

    <div class="relative flex w-full items-center justify-between select-none">
      <div class="flex items-center justify-between gap-x-2">
        <CopyToClipboard
          v-if="applicationState.session_code"
          v-bind:value="applicationState.session_code"
        >
          <button
            class="cursor-pointer rounded-sm px-2 py-1.5 text-gray-500 hover:bg-gray-200 hover:text-black active:translate-y-1"
          >
            <span class="inline-block align-middle font-mono text-base">{{
              applicationState.session_code
            }}</span>
            <Copy v-bind:size="18" class="ml-2 inline-block align-middle" />
          </button>
        </CopyToClipboard>

        <Badge v-if="applicationState.connection_type === 'websocket'" severity="secondary">
          <Wifi v-bind:size="14" />
          <span class="ml-2 font-medium">Server Connection</span>
        </Badge>
        <Badge v-if="applicationState.connection_type === 'webrtc'" severity="success">
          <Router v-bind:size="14" />
          <span class="ml-2 font-medium">Direct Connection</span>
        </Badge>
      </div>

      <Button
        v-if="applicationState.is_host && applicationState.connection_type === 'websocket'"
        v-on:click="WebSocketClient.emit('transfer_host_request', {})"
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
        <template v-if="applicationState.is_host">
          <WaitingForConnections
            v-if="applicationState.clients.length !== applicationState.maximum_clients"
          />
          <FileTransfer v-else-if="applicationState.connection_type === 'webrtc'" />
          <DirectConnectionPrompt v-else-if="applicationState.connection_type === 'websocket'" />
        </template>

        <template v-else>
          <WaitingForHost v-if="applicationState.connection_type === 'websocket'" />
          <FileTransfer v-else-if="applicationState.connection_type === 'webrtc'" />
        </template>
      </div>
    </div>
  </template>

  <template v-else>
    <p>You are not connected</p>
  </template>
</template>
