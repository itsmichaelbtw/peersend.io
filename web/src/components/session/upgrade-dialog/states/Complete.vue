<script setup lang="ts">
import { Router } from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col items-center justify-center space-y-4 p-6">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
      <Router v-bind:size="36" class="text-green-600" />
    </div>
    <div class="text-center">
      <h3 class="text-lg font-medium">Connection Upgraded Successfully!</h3>
      <p class="text-muted-foreground text-sm">
        You're now connected via WebRTC and can transfer files up to 500MB in size.
      </p>
    </div>
  </div>
</template>
