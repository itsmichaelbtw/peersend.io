<script setup lang="ts">
import BackNavigation from "@/components/BackNavigation.vue";

import { Copy, ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";

const sessionCode = "X-4FGS67";
</script>

<template>
  <main>
    <div
      class="container mx-auto flex flex-col items-center justify-center gap-4 py-12 not-sm:py-6 md:py-24 lg:py-32"
    >
      <div class="mx-auto w-full max-w-md space-y-6">
        <BackNavigation text="Create a Session" />

        <Card
          class="not-sm:rounded-none! not-sm:border-none! not-sm:shadow-none!"
          :pt="{
            content: {
              class: 'space-y-2'
            }
          }"
        >
          <template #title>Session Created</template>
          <template #subtitle>Shared this code with someone to start sharing files</template>

          <template #content>
            <div class="rounded border border-gray-200 bg-gray-50 px-4 py-2">
              <div class="flex flex-row items-center justify-between select-none">
                <p class="font-mono text-sm" v-cloak>{{ sessionCode }}</p>

                <Button variant="text" severity="secondary">
                  <Copy :size="20" />
                </Button>
              </div>
            </div>

            <div class="flex items-center justify-end">
              <p class="text-sm text-gray-500">0/2 connected</p>
            </div>

            <Card
              class="rounded! border border-gray-200 bg-gray-50! shadow-none! select-none"
              :pt="{
                title: {
                  class: 'text-base!'
                },
                body: {
                  class: 'p-4!'
                }
              }"
            >
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
            </Card>
          </template>

          <template #footer>
            <Button color="primary" class="w-full"
              >Enter
              <ArrowRight :size="20" />
            </Button>

            <Divider />

            <p class="mt-2 text-xs text-gray-500">This room will expire in 30 minutes if unused</p>
          </template>
        </Card>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Already have a session code?
            <RouterLink to="/session/join" class="text-primary hover:underline"
              >Join session</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
