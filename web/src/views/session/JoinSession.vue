<script setup lang="ts">
import SessionStage from "@/components/session/SessionStage.vue";
import BackdropGrayCard from "@/components/BackdropGrayCard.vue";

import { ArrowRight } from "lucide-vue-next";

const connectionInfoItems = [
  "You'll initially connect via WebSocket",
  "When both users are connected, you can upgrade to a direct connection",
  "File sharing is only available with a direct connection"
];
</script>

<template>
  <SessionStage
    heading="Join a Session"
    :alternative="{
      text: 'Don\'t have a session code?',
      link: '/session/create',
      linkText: 'Create a Session'
    }"
  >
    <template #title>Enter session code</template>
    <template #subtitle>Ask the session host for their unique code</template>
    <template #content>
      <InputText
        class="rounded! font-mono! text-base! shadow-none!"
        placeholder="e.g. X-4FGS67"
        fluid
      />

      <BackdropGrayCard>
        <template #title>What to expect</template>
        <template #content>
          <ul class="text-muted-foreground space-y-2 text-sm">
            <li
              v-for="(item, index) in connectionInfoItems"
              :key="index"
              class="flex items-start gap-2"
            >
              <span class="bg-primary/20 mt-0.5 rounded-full p-1">
                <span class="bg-primary block h-1.5 w-1.5 rounded-full" />
              </span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </template>
      </BackdropGrayCard>
    </template>

    <template #footer>
      <Button color="primary" size="small" fluid
        >Join session
        <ArrowRight :size="20" />
      </Button>
    </template>
  </SessionStage>
</template>
