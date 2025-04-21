<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";

import StatInformation from "./StatInformation.vue";
import SessionPeers from "./SessionPeers.vue";
import TechnicalDetails from "./TechnicalDetails.vue";

import { Zap } from "lucide-vue-next";
import { useConfirm } from "primevue/useconfirm";
import { applicationState } from "@/state/application";

import { useClsx } from "@/composables/use-clsx";

const { classNames, joinCls } = useClsx({
  icon: {
    "bg-primary/50": applicationState.connection_type === "webrtc",
    "bg-gray-200 dark:bg-gray-600": applicationState.connection_type === "websocket"
  }
});

const confirm = useConfirm();

function confirmExit() {
  confirm.require({
    message: "Are you sure you want to leave this session?",
    header: "Leave Session",
    rejectProps: {
      size: "small",
      severity: "secondary"
    },
    acceptProps: {
      size: "small",
      severity: "danger"
    },
    acceptLabel: "Yes, leave this session",
    blockScroll: true,
    modal: true,
    accept() {
      window.location.reload();
    }
  });
}
</script>

<template>
  <ConfirmDialog v-bind:draggable="false" />
  <Card
    v-bind:pt="{
      content: {
        class: 'space-y-2 select-none'
      },
      footer: {
        class: 'space-y-2'
      }
    }"
  >
    <template #title>Connection Status</template>
    <template #content>
      <StatInformation title="Connection type">
        <template v-if="applicationState.connection_type === 'websocket'" #stat>
          <p>WebSocket</p>
        </template>
        <template v-if="applicationState.connection_type === 'webrtc'" #stat>
          <div>
            <p class="inline-block align-middle">WebRTC</p>
            <div class="relative ml-2 inline-flex items-center justify-center align-middle">
              <span
                class="bg-primary/20 absolute h-8 w-8 animate-ping rounded-full opacity-75"
              ></span>
              <span class="bg-primary/30 absolute h-6 w-6 animate-pulse rounded-full"></span>

              <span
                v-bind:class="
                  joinCls(
                    'relative flex h-5 w-5 items-center justify-center rounded-full',
                    classNames.icon
                  )
                "
              >
                <Zap v-bind:size="12" />
              </span>
            </div>
          </div>
        </template>
      </StatInformation>
      <StatInformation title="Role">
        <template #stat>
          <p v-if="applicationState.is_host">Host</p>
          <p v-else>Guest</p>
        </template>
      </StatInformation>
      <StatInformation title="Auto WebRTC">
        <template #stat>
          <span v-if="applicationState.auto_webrtc" class="text-green-400">Enabled</span>
          <span v-else class="text-red-400">Disabled</span>
        </template>
      </StatInformation>
      <StatInformation title="Encryption">
        <template #stat>
          <span v-if="applicationState.encryption_mode !== 'none'" class="text-green-400">{{
            applicationState.encryption_mode
          }}</span>
          <span v-else class="text-red-400">Disabled</span>
        </template>
      </StatInformation>

      <SessionPeers />
      <TechnicalDetails />
    </template>
    <template #footer>
      <Button v-on:click="confirmExit" severity="danger" size="small" fluid> Leave session </Button>
    </template>
  </Card>
</template>
