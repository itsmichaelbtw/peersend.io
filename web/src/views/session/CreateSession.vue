<script setup lang="ts">
import SessionDeck from "@/components/session/SessionDeck.vue";
import BackdropGrayCard from "@/components/BackdropGrayCard.vue";
import CopyToClipboard from "@/components/CopyToClipboard.vue";

import { Copy, ArrowRight, Shield, Globe, Clock, Loader2 } from "lucide-vue-next";

import { WebSocketClient } from "@/lib/websocket";
import { applicationState, socketState } from "@/state/application";
</script>

<template>
  <SessionDeck v-if="applicationState.is_connected" heading="Create a Session">
    <template #title>Session created</template>
    <template #subtitle>Share this code with another user to join this session</template>
    <template #content>
      <BackdropGrayCard>
        <template #content>
          <div class="flex flex-row items-center justify-between select-none">
            <p class="font-mono text-sm" v-cloak>{{ applicationState.session_code }}</p>

            <CopyToClipboard v-bind:value="applicationState.session_code">
              <Button variant="text" severity="secondary">
                <Copy v-bind:size="20" />
              </Button>
            </CopyToClipboard>
          </div>
        </template>
      </BackdropGrayCard>

      <div class="flex items-center justify-end">
        <p class="text-sm text-gray-500">{{ applicationState.clients.length }}/2 connected</p>
      </div>

      <BackdropGrayCard>
        <template #title>Session details</template>
        <template #content>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Maximum connections:</span>
              <span>{{ applicationState.maximum_clients }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Auto WebRTC:</span>
              <span v-if="applicationState.auto_webrtc" class="text-green-400">Enabled</span>
              <span v-else class="text-red-400">Disabled</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">End-to-end encryption:</span>
              <span v-if="applicationState.encryption_mode !== 'none'" class="text-green-400">{{
                applicationState.encryption_mode
              }}</span>
              <span v-else class="text-red-400">Disabled</span>
            </div>
          </div>
        </template>
      </BackdropGrayCard>
    </template>

    <template #footer>
      <RouterLink
        v-bind:to="{
          name: 'active-session',
          params: { session_code: applicationState.session_code! }
        }"
      >
        <Button color="primary" size="small" fluid>
          Enter
          <ArrowRight v-bind:size="18" />
        </Button>
      </RouterLink>

      <p class="mt-2 text-xs text-gray-500">This room will expire in 30 minutes if unused</p>
    </template>
  </SessionDeck>
  <SessionDeck
    v-else
    heading="Create a Session"
    v-bind:alternative="{
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
            <Shield v-bind:size="30" class="mb-2" />
            <h3 class="text-sm font-medium">End-to-End Encrypted</h3>
            <p class="text-xs text-gray-500">Your files stay private</p>
          </div>
          <div class="flex flex-col items-center rounded-lg border border-gray-200 p-3 text-center">
            <Globe v-bind:size="30" class="mb-2" />
            <h3 class="text-sm font-medium">Direct Connection</h3>
            <p class="text-xs text-gray-500">No server storage</p>
          </div>
        </div>
        <div class="flex flex-col items-center rounded-lg border border-gray-200 p-3 text-center">
          <Clock v-bind:size="30" class="mb-2" />
          <h3 class="text-sm font-medium">Temporary Sessions</h3>
          <p class="text-xs text-gray-500">Rooms expire after 30 minutes of inactivity</p>
        </div>
      </div>
    </template>

    <template #footer>
      <Button
        v-bind:disabled="socketState.is_connecting"
        v-on:click="() => WebSocketClient.connect()"
        size="small"
        fluid
      >
        <Loader2 v-if="socketState.is_connecting" v-bind:size="18" class="mr-2 animate-spin" />
        {{ socketState.is_connecting ? "Creating session..." : "Create session" }}
      </Button>
    </template>
  </SessionDeck>
</template>
