<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";
import Select from "primevue/select";

import SelectButton from "primevue/selectbutton";

import { applicationState } from "@/state/application";
import { UserCog } from "lucide-vue-next";
</script>

<template>
  <Panel
    v-bind:pt="{
      root: {
        class: 'w-full'
      }
    }"
    header="Developer Controls"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2">
        <UserCog v-bind:size="22" />
        <span>Developer Options</span>
      </div>
    </template>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        class="flex items-center justify-between space-x-2 rounded-md border border-gray-200 bg-gray-50 p-3"
      >
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium">User Role</h4>
          <p className="text-xs text-muted-foreground">Toggle between host and guest views</p>
        </div>
        <div className="flex items-center space-x-2">
          <span v-if="applicationState.is_host" className="text-xs">Host</span>
          <span v-else className="text-xs">Guest</span>
          <ToggleSwitch v-model="applicationState.is_host" />
        </div>
      </div>

      <div
        class="flex items-center justify-between space-x-2 rounded-md border border-gray-200 bg-gray-50 p-3"
      >
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium">Connection</h4>
          <p className="text-xs text-muted-foreground">Simulate connection state</p>
        </div>
        <Select
          v-model="applicationState.connection_type"
          v-bind:options="[
            { name: 'WebSocket', code: 'websocket' },
            { name: 'WebRTC', code: 'webrtc' },
            { name: 'None', code: 'none' }
          ]"
          option-label="name"
          option-value="code"
          placeholder="Connection type"
          size="small"
        />
      </div>

      <div
        class="flex items-center justify-between space-x-2 rounded-md border border-gray-200 bg-gray-50 p-3"
      >
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium">Peer Count</h4>
          <p className="text-xs text-muted-foreground">Number of peers in the session</p>
        </div>

        <SelectButton
          v-model="applicationState.clients.length"
          v-bind:options="[1, 2]"
          size="small"
        />
      </div>
    </div>
  </Panel>
</template>
