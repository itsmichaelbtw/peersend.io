<script setup lang="ts">
import type { ComponentTypes } from "@/types/components";

const props = defineProps<ComponentTypes.SessionProps.StatInformation>();
</script>

<template>
  <div class="flex flex-row items-center justify-between border-b border-gray-200 pb-2 text-sm">
    <p class="text-gray-500">{{ props.title }}</p>
    <slot name="stat">
      <p v-if="props.stat">{{ props.stat }}</p>
    </slot>
  </div>
</template>
