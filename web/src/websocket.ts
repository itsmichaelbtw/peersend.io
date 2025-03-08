let socket: WebSocket | null = null;

export function initialiseWebsocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  socket = new WebSocket("ws://localhost:8080/signal");

  socket.onopen = function () {
    console.log("Websocket connected");
  };

  socket.onmessage = function (event) {
    console.log("Websocket message", event.data);
  };

  socket.onerror = function (event) {
    console.error("Websocket error", event);
  };

  socket.onclose = function (event) {
    console.log("Websocket closed", event);
  };
}
