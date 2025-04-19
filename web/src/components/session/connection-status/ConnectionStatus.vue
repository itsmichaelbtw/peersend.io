<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";

import StatInformation from "./StatInformation.vue";
import ConnectionDetails from "./ConnectionDetails.vue";
import SessionPeers from "./SessionPeers.vue";

import { useConfirm } from "primevue/useconfirm";
import { websocketState } from "@/state/websocket";

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
  <ConfirmDialog />
  <Card
    :pt="{
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
      <StatInformation v-if="websocketState.connection_type !== 'none'" title="Connection type">
        <template v-if="websocketState.connection_type === 'signal'" #stat>
          <p>WebSocket</p>
        </template>
        <template v-if="websocketState.connection_type === 'direct'" #stat>
          <p>WebRTC (P2P)</p>
        </template>
      </StatInformation>
      <StatInformation title="Role">
        <template #stat>
          <p v-if="websocketState.is_host">Host</p>
          <p v-else>Guest</p>
        </template>
      </StatInformation>
      <StatInformation title="Auto WebRTC">
        <template #stat>
          <span v-if="websocketState.auto_webrtc" class="text-green-400">Enabled</span>
          <span v-else class="text-red-400">Disabled</span>
        </template>
      </StatInformation>
      <StatInformation title="Encryption">
        <template #stat>
          <span v-if="websocketState.encryption_mode !== 'none'" class="text-green-400">{{
            websocketState.encryption_mode
          }}</span>
          <span v-else class="text-red-400">Disabled</span>
        </template>
      </StatInformation>

      <SessionPeers />
      <ConnectionDetails />
    </template>
    <template #footer>
      <Button v-if="!websocketState.auto_webrtc" size="small" severity="secondary" fluid>
        Upgrade to direct
      </Button>
      <Button v-on:click="confirmExit" severity="danger" size="small" fluid> Leave session </Button>
    </template>
  </Card>
</template>
