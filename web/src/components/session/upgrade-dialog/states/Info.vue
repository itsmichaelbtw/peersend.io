<script setup lang="ts">
import { ArrowUpFromLine, Shield, Lock } from "lucide-vue-next";
import { applicationState } from "@/state/application";
</script>
<template>
  <div class="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
    <div class="flex items-center gap-3">
      <ArrowUpFromLine v-bind:size="30" class="text-blue-500" />
      <div>
        <h3 class="font-medium text-blue-800">Connection Upgrade Process</h3>
        <p class="text-sm text-blue-700">
          This is a one-time process that takes just a few seconds to complete
        </p>
      </div>
    </div>
  </div>

  <div
    v-if="applicationState.encryption_mode !== 'none'"
    class="rounded-lg border border-gray-200 p-4"
  >
    <div class="flex items-center gap-3">
      <Shield v-bind:size="30" class="text-black" />
      <div>
        <h3 class="font-medium">Enhanced Security</h3>
        <p class="text-sm text-gray-500">
          WebRTC provides end-to-end encryption for your file transfers
        </p>
      </div>
    </div>
  </div>

  <div class="rounded-lg border border-gray-200 p-4">
    <div class="flex items-center gap-3">
      <Lock v-bind:size="30" class="text-primary" />
      <div>
        <h3 class="font-medium">Direct Peer-to-Peer</h3>
        <p class="text-sm text-gray-500">
          Files are transferred directly between devices, not through our servers
        </p>
      </div>
    </div>
  </div>
</template>
