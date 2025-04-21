<script setup lang="ts">
import { Clock } from "lucide-vue-next";
</script>

<template>
  <Card>
    <template #title> Standby Mode </template>
    <template #subtitle> Waiting for the host to begin the connection </template>
    <template #content>
      <div class="mx-auto flex max-w-lg flex-col items-center justify-center py-8">
        <div class="mb-6 flex h-18 w-18 items-center justify-center rounded-full bg-gray-100">
          <Clock v-bind:size="32" class="text-gray-500" />
        </div>
        <h3 class="text-xl font-medium">Pending Host Action</h3>
        <p class="text-center text-gray-500">
          Hang tight — the host will kick off the file transfer once they're ready
        </p>
      </div>
    </template>
  </Card>
</template>
