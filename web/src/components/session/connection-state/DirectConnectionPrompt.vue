<script setup lang="ts">
import UpgradeDialog from "../upgrade-dialog/UpgradeDialog.vue";

import { ref } from "vue";
import { Router } from "lucide-vue-next";

const dialogVisible = ref(false);
</script>

<template>
  <UpgradeDialog
    v-bind:visible="dialogVisible"
    v-bind:onChange="(visible: boolean) => (dialogVisible = visible)"
  />
  <Card>
    <template #title>Establish Direct Connection</template>
    <template #subtitle>File transfers require a peer-to-peer WebRTC connection</template>
    <template #content>
      <div class="mx-auto flex max-w-lg flex-col items-center justify-center py-8">
        <div class="mb-6 flex h-18 w-18 items-center justify-center rounded-full bg-gray-100">
          <Router v-bind:size="32" class="text-gray-500" />
        </div>
        <h3 class="text-xl font-medium">Direct Connection Available</h3>
        <p class="text-center text-gray-500">
          Your session is full and ready for file transfers, but you need to establish a direct
          connection first.
        </p>

        <Button size="small" class="mt-8" v-on:click="dialogVisible = true">
          Establish Connection
        </Button>
      </div>
    </template>
  </Card>
</template>
