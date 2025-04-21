<script setup lang="ts">
import { websocketState } from "@/state/websocket";
import { UsersRound } from "lucide-vue-next";
</script>

<template>
  <Card>
    <template #title>
      Waiting for Clients ({{ websocketState.clients.length }}/{{ websocketState.maximum_clients }})
    </template>
    <template #subtitle> More clients are required to establish a direct connection </template>
    <template #content>
      <div class="mx-auto flex max-w-lg flex-col items-center justify-center py-8">
        <div class="mb-6 flex h-18 w-18 items-center justify-center rounded-full bg-gray-100">
          <UsersRound v-bind:size="32" class="text-gray-500" />
        </div>
        <h3 class="text-xl font-medium">Invite Clients to Join</h3>
        <p class="text-center text-gray-500">Share the session code to start a direct connection</p>
      </div>
    </template>
  </Card>
</template>
