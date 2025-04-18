<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import type { FormValues } from "@/types/forms";

import SessionDeck from "@/components/session/SessionDeck.vue";
import BackdropGrayCard from "@/components/BackdropGrayCard.vue";

import Message from "primevue/message";

import { watch } from "vue";
import { useRouter } from "vue-router";

import { ArrowRight, Loader2 } from "lucide-vue-next";
import { Form } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { JoinSessionSchema } from "@/config/schemas";
import { WebSocketClient } from "@/lib/websocket";
import { websocketState } from "@/state/websocket";
import { sleep } from "@/utils/sleep";

const router = useRouter();

watch(websocketState, () => {
  if (websocketState.is_connected) {
    router.push(`/session/${websocketState.session_code}`);
  }
});

const connectionInfoItems: string[] = [
  "You'll initially connect via WebSocket",
  "When both users are connected, you can upgrade to a direct connection",
  "File sharing is only available with a direct connection"
];

const initialValues: FormValues.JoinSession = {
  sessionCode: ""
};

const resolver = zodResolver(JoinSessionSchema);

function onFormSubmit(event: FormSubmitEvent): void {
  if (event.valid) {
    websocketState.is_connecting = true;

    sleep(500).then(() => {
      WebSocketClient.connect(event.values.sessionCode);
    });
  }
}
</script>

<template>
  <SessionDeck
    heading="Join a Session"
    v-bind:alternative="{
      text: 'Don\'t have a session code?',
      link: '/session/create',
      linkText: 'Create a Session'
    }"
  >
    <template #title>Enter session code</template>
    <template #subtitle>Ask the session host for their unique code</template>
    <template #content>
      <Form
        v-slot="$form"
        v-bind:resolver
        v-bind:initialValues
        v-bind:submit="onFormSubmit"
        class="space-y-4"
      >
        <div>
          <InputText
            type="text"
            name="sessionCode"
            placeholder="e.g. X-4FGS67"
            class="rounded! font-mono! shadow-none"
            size="small"
            fluid
          />

          <Message v-if="$form.sessionCode?.invalid" severity="error" size="small" variant="simple">
            {{ $form.sessionCode.error.message }}
          </Message>
        </div>

        <BackdropGrayCard>
          <template #title>What to expect</template>
          <template #content>
            <ul class="text-muted-foreground space-y-2 text-sm">
              <li
                v-for="(item, index) in connectionInfoItems"
                v-bind:key="index"
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

        <div class="mt-4">
          <Button
            type="submit"
            v-bind:disabled="websocketState.is_connecting"
            color="primary"
            size="small"
            fluid
          >
            <Loader2 v-if="websocketState.is_connecting" class="mr-2 h-4 w-4 animate-spin" />
            {{ websocketState.is_connecting ? "Joining..." : "Join" }}
            <ArrowRight v-if="!websocketState.is_connecting" :size="20" />
          </Button>
        </div>
      </Form>
    </template>
  </SessionDeck>
</template>
