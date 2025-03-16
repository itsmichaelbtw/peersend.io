<script setup lang="ts">
defineProps();
</script>

<template>
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
</template>
