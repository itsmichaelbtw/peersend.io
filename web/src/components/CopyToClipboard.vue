<script setup lang="ts">
import type { ComponentTypes } from "@/types/components";
import { useCopyToClipboard } from "@/composables/use-copy-to-clipboard";

const props = defineProps<ComponentTypes.CopyToClipboard>();

const { copy } = useCopyToClipboard();

function onClick() {
  if (!props.value) {
    return;
  }

  copy(props.value);
}
</script>

<template>
  <div v-on:click="onClick">
    <slot>
      <button class="text-sm text-blue-500 underline">Copy</button>
    </slot>
  </div>
</template>
