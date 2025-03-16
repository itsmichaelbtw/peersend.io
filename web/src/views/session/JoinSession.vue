<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import type { FormValues } from "@/types/forms";

import SessionStage from "@/components/session/SessionStage.vue";
import BackdropGrayCard from "@/components/BackdropGrayCard.vue";

import Message from "primevue/message";

import { useRouter } from "vue-router";
import { ArrowRight } from "lucide-vue-next";
import { Form } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { JoinSessionSchema } from "@/config/schemas";

const router = useRouter();

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
  router.push(`/session/${event.values.sessionCode}`);
}
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
      <Form
        v-slot="$form"
        :resolver="resolver"
        :initialValues="initialValues"
        v-on:submit="onFormSubmit"
        class="space-y-4"
      >
        <div class="flex flex-col gap-1">
          <InputText
            name="sessionCode"
            class="rounded! font-mono! shadow-none!"
            placeholder="e.g. X-4FGS67"
            size="small"
            fluid
            :class="{ 'p-invalid': $form.sessionCode?.invalid }"
          />
          <Message v-if="$form.sessionCode?.invalid" severity="error" size="small" variant="simple">
            {{ $form.sessionCode.error?.message }}
          </Message>
        </div>

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

        <div class="mt-4">
          <Button type="submit" color="primary" size="small" fluid>
            Join session
            <ArrowRight :size="20" />
          </Button>
        </div>
      </Form>
    </template>
  </SessionStage>
</template>
