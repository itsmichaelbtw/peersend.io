import type { WebSocketState } from "@/types/state";

import { reactive } from "vue";

export const websocketState = reactive<WebSocketState>({
  ws: null,
  session_code: null,
  is_host: false,
  is_connected: false,
  client_id: null,
  last_error_message: null
});
