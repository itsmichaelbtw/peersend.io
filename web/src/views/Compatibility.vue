<script setup lang="ts">
import { useCompatibility } from "@/composables/use-compatibility";
import { AlertTriangle, Check } from "lucide-vue-next";

const { browser, isChecking, isCompatible } = useCompatibility();
</script>

<template>
  <template v-if="isChecking">
    <div class="relative mx-auto w-full max-w-lg">
      <div class="flex h-screen flex-col items-center justify-center px-8">
        <h2 class="mb-2 text-xl font-semibold">Checking Compatibility...</h2>
        <p class="text-center text-gray-600">
          Please wait while we check your browser's WebRTC support.
        </p>
      </div>
    </div>
  </template>

  <template v-else-if="isCompatible">
    <div class="relative mx-auto w-full max-w-lg">
      <div class="flex h-screen flex-col items-center justify-center px-8">
        <div class="mb-6 h-fit w-fit rounded-full bg-green-100 p-4">
          <Check v-bind:size="36" class="text-green-400" />
        </div>

        <h2 class="mb-2 text-xl font-semibold">Browser Compatible</h2>

        <p class="mb-4 text-center leading-tight text-gray-700">
          Your browser<span v-if="browser !== 'Unknown'"> ({{ browser }})</span> fully supports
          WebRTC, allowing you to establish secure, peer-to-peer connections for real-time
          communication and data transfers.
        </p>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="relative mx-auto w-full max-w-lg">
      <div class="flex h-screen flex-col items-center justify-center px-8">
        <div class="mb-6 h-fit w-fit rounded-full bg-red-100 p-4">
          <AlertTriangle v-bind:size="36" class="text-red-400" />
        </div>

        <h2 class="mb-2 text-xl font-semibold">Incompatible Browser</h2>

        <p class="mb-8 text-center leading-tight">
          Your browser <span v-if="browser != 'unknown'">({{ browser }})</span> doesn't fully
          support WebRTC technology, which is required for PeerSend's direct peer-to-peer file
          transfers.
        </p>

        <div class="mb-4 rounded-md bg-red-50 p-4 text-red-800">
          <p class="mb-1 font-medium">Why does this matter?</p>
          <p class="text-sm">
            PeerSend uses WebRTC to create secure, direct connections between devices without
            storing files on our servers. Without WebRTC support, you won't be able to send or
            receive files.
          </p>
        </div>
      </div>
    </div>
  </template>
</template>
