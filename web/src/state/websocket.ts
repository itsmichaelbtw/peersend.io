import type { WebSocketState } from "@/types/state";

import { reactive } from "vue";

export const websocketState = reactive<WebSocketState>({
  ws: null,
  session_code: null,
  clients: [],
  is_host: false,
  is_connected: false,
  is_connecting: false,
  client_id: null,
  maximum_clients: 0,
  last_error: null
});
