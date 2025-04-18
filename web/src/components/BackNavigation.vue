<script setup lang="ts">
import type { ComponentTypes } from "@/types/components";

import { useRouter } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";

const props = defineProps<ComponentTypes.BackNavigation>();

const router = useRouter();

function handleNavigation() {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      variant="text"
      severity="secondary"
      class="hover:bg-gray-100!"
      v-on:click="handleNavigation"
    >
      <ChevronLeft v-bind:size="20" />
    </Button>
    <h1 v-if="text" class="p-card-title text-2xl" style="color: var(--p-card-color)">{{ text }}</h1>
  </div>
</template>
