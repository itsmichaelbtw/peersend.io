<script setup lang="ts">
import type { ComponentTypes } from "@/types/components";

import Dialog from "primevue/dialog";

import InfoState from "./states/Info.vue";
import UpgradingState from "./states/Upgrading.vue";
import CompleteState from "./states/Complete.vue";

import { Loader2 } from "lucide-vue-next";

import { rtcState } from "@/state/application";
import { WebRTCClient } from "@/lib/webrtc";
import { dialogState } from "@/state/dialog";

const props = defineProps<ComponentTypes.SessionProps.ConnectionUpgradeDialog>();
</script>

<template>
  <Dialog
    v-bind:pt="{
      root: {
        class: 'max-w-md'
      },
      content: {
        class: 'space-y-4'
      }
    }"
    v-bind:visible="props.visible"
    v-bind:modal="true"
    v-bind:block-scroll="true"
    v-bind:draggable="false"
    v-bind:dismissable-mask="!rtcState.is_connecting"
    v-bind:closable="!rtcState.is_connecting"
    v-bind:close-on-escape="!rtcState.is_connecting"
    v-on:update:visible="props.onChange"
    header="Direct Connection"
  >
    <template #default>
      <span class="block leading-tight text-gray-500" v-if="!rtcState.is_connected"
        >To transfer files securely between peers, we need to upgrade your connection</span
      >

      <UpgradingState v-if="rtcState.is_connecting" />
      <CompleteState v-else-if="rtcState.is_connected" />
      <InfoState v-else />
    </template>

    <template #footer>
      <Button
        v-if="!rtcState.is_connected"
        v-on:click="WebRTCClient.connect"
        v-bind:disabled="rtcState.is_connecting"
        size="small"
      >
        <Loader2 v-if="rtcState.is_connecting" v-bind:size="18" class="mr-2 animate-spin" />
        {{ rtcState.is_connecting ? "Upgrading..." : "Upgrade Connection" }}
      </Button>

      <Button v-else v-on:click="dialogState.upgradeDialogVisible = false" size="small">
        Close
      </Button>
    </template>
  </Dialog>
</template>
