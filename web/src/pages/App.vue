<template>
  <div class="container mx-auto">
    <div class="h-screen flex flex-col items-center justify-center gap-4">
      <div
        v-if="state.error_message"
        class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 space-x-1"
      >
        <span class="block sm:inline">{{ state.error_message }}</span>
      </div>

      <template v-if="state.is_connected">
        <div class="text-2xl font-bold mb-2">
          Session Code: {{ state.session_code }}
          <span v-if="state.is_host" class="text-sm text-gray-500 ml-2">(Host)</span>
        </div>
        <div class="text-sm text-gray-600 mb-2">Client ID: {{ state.client_id }}</div>
        <div class="flex gap-2">
          <Button
            v-if="state.is_host"
            severity="secondary"
            v-on:click="transferHost"
            label="Transfer Host"
          />
          <Button severity="danger" v-on:click="disconnect" label="Disconnect" />
        </div>
      </template>
      <template v-else>
        <div class="flex flex-col gap-4 items-center">
          <input
            v-model="joinCode"
            placeholder="Session code (optional)"
            class="px-4 py-2 border rounded"
          />
          <Button severity="primary" v-on:click="connect" label="Connect" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { initialiseWebsocket, disconnectWebsocket, deliverPayload, state } from "../lib/websocket";

const joinCode = ref("");

function connect() {
  initialiseWebsocket(joinCode.value || undefined);
  joinCode.value = "";
}

function disconnect() {
  disconnectWebsocket();
}

function transferHost() {
  deliverPayload("signal", { type: "transfer_host_request" });
}
</script>
