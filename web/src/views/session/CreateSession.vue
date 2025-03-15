<script setup lang="ts">
import SessionContainer from "@/components/session/SessionContainer.vue";
import SessionCard from "@/components/session/SessionCard.vue";

import { Copy, ArrowRight } from "lucide-vue-next";

const sessionCode = "X-4FGS67";
</script>

<template>
  <SessionContainer
    heading="Create a Session"
    :alternative="{
      text: 'Already have a session code?',
      link: '/session/join',
      linkText: 'Join session'
    }"
  >
    <template #title>Session Created</template>
    <template #subtitle>Share this code with your friends to join the session</template>
    <template #content>
      <SessionCard>
        <template #content>
          <div class="flex flex-row items-center justify-between select-none">
            <p class="font-mono text-sm" v-cloak>{{ sessionCode }}</p>

            <Button variant="text" severity="secondary">
              <Copy :size="20" />
            </Button>
          </div>
        </template>
      </SessionCard>

      <div class="flex items-center justify-end">
        <p class="text-sm text-gray-500">0/2 connected</p>
      </div>

      <SessionCard>
        <template #title>Session details</template>
        <template #content>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Maximum connections:</span>
              <span>2</span>
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
      </SessionCard>
    </template>

    <template #footer>
      <Button color="primary" class="w-full"
        >Enter
        <ArrowRight :size="20" />
      </Button>

      <Divider />

      <p class="mt-2 text-xs text-gray-500">This room will expire in 30 minutes if unused</p>
    </template>
  </SessionContainer>
</template>
