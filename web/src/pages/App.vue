<template>
  <div class="container mx-auto">
    <div class="h-screen flex flex-col items-center justify-center gap-4">
      <template v-if="state.is_connected">
        <div class="text-2xl font-bold mb-2">
          Session Code: {{ state.session_code }}
          <span v-if="state.is_host" class="text-sm text-gray-500 ml-2">(Host)</span>
        </div>
        <div class="text-sm text-gray-600 mb-2">Client ID: {{ state.client_id }}</div>
        <Button severity="danger" v-on:click="disconnect" label="Disconnect" />
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
import { initialiseWebsocket, disconnectWebsocket, state } from "../lib/websocket";

const joinCode = ref("");

function connect() {
  initialiseWebsocket(joinCode.value || undefined);
  joinCode.value = "";
}

function disconnect() {
  disconnectWebsocket();
}
</script>
