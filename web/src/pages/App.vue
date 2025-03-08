<template>
  <div class="container mx-auto">
    <div class="h-screen flex items-center justify-center">
      <Button v-bind:click="connect" text="Connect" />
    </div>
  </div>
</template>

<script>
import { initialiseWebsocket } from "@/websocket";

export default {
  methods: {
    connect() {
      initialiseWebsocket();
    }
  }
};
</script>
