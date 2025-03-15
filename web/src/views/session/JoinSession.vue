<script setup lang="ts">
import BackNavigation from "@/components/BackNavigation.vue";

import { ArrowRight } from "lucide-vue-next";

const connectionInfoItems = [
  "You'll initially connect via WebSocket",
  "When both users are connected, you can upgrade to a direct connection",
  "File sharing is only available with a direct connection"
];
</script>

<template>
  <main>
    <div
      class="container mx-auto flex flex-col items-center justify-center gap-4 py-12 not-sm:py-6 md:py-24 lg:py-32"
    >
      <div class="mx-auto w-full max-w-md space-y-6">
        <BackNavigation text="Join a Session" />

        <Card
          class="not-sm:rounded-none! not-sm:border-none! not-sm:shadow-none!"
          :pt="{
            content: {
              class: 'space-y-8'
            }
          }"
        >
          <template #title>Enter Session Code</template>
          <template #subtitle>Ask the session host for their unique code</template>

          <template #content>
            <InputText
              class="rounded! font-mono! text-base! shadow-none!"
              placeholder="e.g. X-4FGS67"
              fluid
            />

            <Card
              class="rounded! border border-gray-200 bg-gray-50! shadow-none! select-none"
              :pt="{
                title: {
                  class: 'text-base!'
                },
                body: {
                  class: 'p-4!'
                },
                content: {
                  class: 'space-y-1'
                }
              }"
            >
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
            </Card>
          </template>

          <template #footer>
            <Button color="primary" class="w-full"
              >Join Session
              <ArrowRight :size="20" />
            </Button>
          </template>
        </Card>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Don't have a session code?
            <RouterLink to="/session/create" class="text-primary hover:underline"
              >Create a session</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
