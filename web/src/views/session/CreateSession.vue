<script setup lang="ts">
import SessionStage from "@/components/session/SessionStage.vue";
import BackdropGrayCard from "@/components/BackdropGrayCard.vue";

import { Copy, ArrowRight, Shield, Globe, Clock, Loader2 } from "lucide-vue-next";

import { useWebSocket } from "@/composables/use-websocket";
import { websocketState } from "@/state/websocket";
import { sleep } from "@/utils/sleep";

const { connect } = useWebSocket();

function onConnect() {
  websocketState.is_connecting = true;

  sleep(500).then(() => {
    connect();
  });
}
</script>

<template>
  <SessionStage v-if="websocketState.is_connected" heading="Create a Session">
    <template #title>Session created</template>
    <template #subtitle>Share this code with another user to join this session</template>
    <template #content>
      <BackdropGrayCard>
        <template #content>
          <div class="flex flex-row items-center justify-between select-none">
            <p class="font-mono text-sm" v-cloak>{{ websocketState.session_code }}</p>

            <Button variant="text" severity="secondary">
              <Copy :size="20" />
            </Button>
          </div>
        </template>
      </BackdropGrayCard>

      <div class="flex items-center justify-end">
        <p class="text-sm text-gray-500">{{ websocketState.clients.length }}/2 connected</p>
      </div>

      <BackdropGrayCard>
        <template #title>Session details</template>
        <template #content>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Maximum connections:</span>
              <span>{{ websocketState.maximum_clients }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Auto WebRTC:</span>
              <span class="text-red-400">Disabled</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">End-to-end encryption:</span>
              <span class="text-red-400">Disabled</span>
            </div>
          </div>
        </template>
      </BackdropGrayCard>
    </template>

    <template #footer>
      <RouterLink
        :to="{ name: 'active-session', params: { session_code: websocketState.session_code! } }"
      >
        <Button color="primary" size="small" fluid>
          Enter
          <ArrowRight :size="20" />
        </Button>
      </RouterLink>

      <p class="mt-2 text-xs text-gray-500">This room will expire in 30 minutes if unused</p>
    </template>
  </SessionStage>
  <SessionStage
    v-else
    heading="Create a Session"
    :alternative="{
      text: 'Already have a session code?',
      link: '/session/join',
      linkText: 'Join session'
    }"
  >
    <template #title>Start a new session</template>
    <template #subtitle>Create a secure session to share files with another person</template>
    <template #content>
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col items-center rounded-lg border border-gray-200 p-3 text-center">
            <Shield class="mb-2 h-8 w-8" />
            <h3 class="text-sm font-medium">End-to-End Encrypted</h3>
            <p class="text-muted-foreground text-xs">Your files stay private</p>
          </div>
          <div class="flex flex-col items-center rounded-lg border border-gray-200 p-3 text-center">
            <Globe class="mb-2 h-8 w-8" />
            <h3 class="text-sm font-medium">Direct Connection</h3>
            <p class="text-muted-foreground text-xs">No server storage</p>
          </div>
        </div>
        <div class="flex flex-col items-center rounded-lg border border-gray-200 p-3 text-center">
          <Clock class="mb-2 h-8 w-8" />
          <h3 class="text-sm font-medium">Temporary Sessions</h3>
          <p class="text-muted-foreground text-xs">Rooms expire after 30 minutes of inactivity</p>
        </div>
      </div>
    </template>

    <template #footer>
      <Button :disabled="websocketState.is_connecting" v-on:click="onConnect" size="small" fluid>
        <Loader2 v-if="websocketState.is_connecting" class="mr-2 h-4 w-4 animate-spin" />
        {{ websocketState.is_connecting ? "Creating session..." : "Create session" }}
      </Button>
    </template>
  </SessionStage>
</template>
