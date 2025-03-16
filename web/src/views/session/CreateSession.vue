<script setup lang="ts">
import SessionContainer from "@/components/session/SessionContainer.vue";
import SessionCard from "@/components/session/SessionCard.vue";

import { Copy, ArrowRight, Shield, Globe, Clock, Loader2 } from "lucide-vue-next";

import { ref } from "vue";

const sessionCode = "X-4FGS67";
const created = ref(false);
const isCreating = ref(false);

function createSession() {
  isCreating.value = true;

  setTimeout(() => {
    isCreating.value = false;
    created.value = true;
  }, 2000);
}
</script>

<template>
  <SessionContainer
    v-if="created"
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
      <RouterLink :to="{ name: 'active-session', params: { session_code: sessionCode } }">
        <Button color="primary" class="w-full">
          Enter
          <ArrowRight :size="20" />
        </Button>
      </RouterLink>

      <p class="mt-2 text-xs text-gray-500">This room will expire in 30 minutes if unused</p>
    </template>
  </SessionContainer>
  <SessionContainer heading="Create a Session" v-else>
    <template #title>Start a new session</template>
    <template #subtitle>Create a secure session to share files with another person</template>
    <template #content>
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col items-center rounded-lg border p-3 text-center">
            <Shield class="mb-2 h-8 w-8" />
            <h3 class="text-sm font-medium">End-to-End Encrypted</h3>
            <p class="text-muted-foreground text-xs">Your files stay private</p>
          </div>
          <div class="flex flex-col items-center rounded-lg border p-3 text-center">
            <Globe class="mb-2 h-8 w-8" />
            <h3 class="text-sm font-medium">Direct Connection</h3>
            <p class="text-muted-foreground text-xs">No server storage</p>
          </div>
        </div>
        <div class="flex flex-col items-center rounded-lg border p-3 text-center">
          <Clock class="mb-2 h-8 w-8" />
          <h3 class="text-sm font-medium">Temporary Sessions</h3>
          <p class="text-muted-foreground text-xs">Rooms expire after 30 minutes of inactivity</p>
        </div>
      </div>

      <Button :loading="isCreating" size="small" fluid v-on:click="createSession">
        Create Session
      </Button>
    </template>
  </SessionContainer>
</template>
