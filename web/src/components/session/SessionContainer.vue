<script setup lang="ts">
import type { ComponentTypes } from "@/types/components";

import BackNavigation from "@/components/BackNavigation.vue";
import { RouterLink } from "vue-router";

defineProps<ComponentTypes.SessionProps.Container>();
</script>

<template>
  <main>
    <div
      class="container mx-auto flex flex-col items-center justify-center gap-4 py-12 not-sm:py-6 md:py-24 lg:py-32"
    >
      <div class="mx-auto w-full max-w-md space-y-6">
        <BackNavigation :text="heading" />

        <Card
          class="not-sm:rounded-none! not-sm:border-none! not-sm:shadow-none!"
          :pt="{
            content: {
              class: 'space-y-4'
            }
          }"
        >
          <template v-if="$slots.title" #title>
            <slot name="title"></slot>
          </template>

          <template v-if="$slots.subtitle" #subtitle>
            <slot name="subtitle"></slot>
          </template>

          <template v-if="$slots.content" #content>
            <slot name="content"></slot>
          </template>

          <template v-if="$slots.footer" #footer>
            <slot name="footer"></slot>
          </template>
        </Card>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            {{ alternative.text }}
            <RouterLink :to="alternative.link" class="text-primary hover:underline">
              {{ alternative.linkText }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
