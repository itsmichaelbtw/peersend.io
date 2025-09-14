import type { NetworkClients } from "../utils";
import type { WebRtcMessages } from "./types";

import { getAppState, handleSessionError, updateState } from "@/state/app-state";
import { getNetworkingClients } from "../utils";

export class CustomDataChannel {
  private network_clients: NetworkClients;
  private channel: RTCDataChannel;

  constructor(channel: RTCDataChannel) {
    this.network_clients = getNetworkingClients();
    this.channel = channel;
    this.channel.addEventListener("open", this.on_open.bind(this));
    this.channel.addEventListener("close", this.on_close.bind(this));
    this.channel.addEventListener("error", this.on_error.bind(this));
    this.channel.addEventListener("message", this.on_message.bind(this));
  }

  private on_open(event: Event) {
    const { sessionState } = getAppState();

    if (sessionState.isHost) {
      return;
    }

    this.network_clients.wrtc.start_latency_monitoring();
  }

  private on_close(event: Event) {}

  private on_error(event: RTCErrorEvent) {
    if (event.error) {
      handleSessionError({
        title: "Direct Connection Error",
        message:
          event.error instanceof Error
            ? event.error.message
            : "An error occurred with the direct connection"
      });
    }
  }

  private on_message(event: MessageEvent) {
    const { sessionState, webrtcState } = getAppState();

    if (sessionState.lastError || webrtcState.isConnecting) {
      updateState({
        sessionState: {
          lastError: null
        },
        websocketState: {
          isConnecting: false
        }
      });
    }

    try {
      const { type, data } = JSON.parse(event.data) as WebRtcMessages.IncomingMessage;
      this.network_clients.wrtc.message_bus.emit(type, data);
    } catch (error) {
      handleSessionError({
        title: "Message Error happened here",
        message: error instanceof Error ? error.message : "Failed to parse incoming WebRTC message"
      });
    }
  }

  public get _channel() {
    return this.channel;
  }

  public get readyState() {
    return this.channel.readyState;
  }

  public send(data: any) {
    this.channel.send(data);
  }

  public close() {
    this.channel.close();
  }
}
