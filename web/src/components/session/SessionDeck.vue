<script setup lang="ts">
import type { ComponentTypes } from "@/types/components";

import BackNavigation from "@/components/BackNavigation.vue";

import { RouterLink } from "vue-router";

defineProps<ComponentTypes.SessionProps.Deck>();
</script>

<template>
  <div class="mx-auto w-full max-w-md space-y-6">
    <BackNavigation :text="heading" :to="backNavigation" />

    <Card
      class="not-sm:rounded-none! not-sm:border-none! not-sm:shadow-none!"
      :pt="{
        subtitle: {
          class: 'leading-tight'
        },
        content: {
          class: 'space-y-2'
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

    <div class="mt-6 text-center" v-if="alternative">
      <p class="text-sm text-gray-500">
        {{ alternative.text }}
        <RouterLink :to="alternative.link" class="text-primary hover:underline">
          {{ alternative.linkText }}
        </RouterLink>
      </p>
    </div>
  </div>
</template>
