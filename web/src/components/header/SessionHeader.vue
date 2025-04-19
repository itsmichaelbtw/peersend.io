<script setup lang="ts">
import AppLogo from "../AppLogo.vue";

import { UsersRound, Crown } from "lucide-vue-next";
import { websocketState } from "@/state/websocket";
</script>

<template>
  <header class="border-b border-gray-200">
    <div class="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <AppLogo />

      <template v-if="websocketState.session_code && websocketState.is_connected">
        <div class="select-none">
          <div class="flex items-center justify-center gap-x-2">
            <Badge v-if="websocketState.is_host" size="large" severity="secondary">
              <Crown class="mr-2 inline align-middle" v-bind:size="16" />
              <span class="inline-block align-middle">Host</span>
            </Badge>

            <Badge size="large" severity="secondary">
              <UsersRound class="mr-2 inline align-middle" v-bind:size="16" />
              <span class="inline-block align-middle">
                {{ websocketState.clients.length }}/{{ websocketState.maximum_clients }}
                Connected
              </span>
            </Badge>
          </div>
        </div>
      </template>
    </div>
  </header>
</template>
