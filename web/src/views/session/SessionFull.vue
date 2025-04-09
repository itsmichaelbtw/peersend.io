<script setup lang="ts">
import SessionStage from "@/components/session/SessionStage.vue";

import { WifiOff } from "lucide-vue-next";

import { RouterLink } from "vue-router";

const sessionCode = "X-4FGS67";
</script>

<template>
  <SessionStage heading="Room Full" back-navigation="/">
    <template #title>
      <div class="flex flex-row items-center">
        <WifiOff :size="24" class="text-red-500" />
        <span class="ml-2">Connection failed</span>
      </div>
    </template>
    <template #subtitle>This room is full (2/2)</template>
    <template #content>
      <div class="my-4 rounded bg-red-50 p-4 text-red-800">
        <p class="text-sm leading-normal">
          The session <span class="font-mono font-bold">{{ sessionCode }}</span> is currently full.
          Each room can only support a maximum of 2 concurrent connections.
        </p>
      </div>
    </template>

    <template #footer>
      <p class="text-sm">You can try again later or create your own room.</p>

      <RouterLink to="/session/create">
        <Button class="mt-4" size="small">Create Session</Button>
      </RouterLink>
    </template>
  </SessionStage>
</template>
