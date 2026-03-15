export interface WebSocketAdapterEvents {
	onOpen(): void;
	onClose(event: CloseEvent): void;
	onError(): void;
	onMessage(event: MessageEvent): void;
}

export class WebSocketAdapter {
	private readonly socket: WebSocket;

	constructor(url: string, events: WebSocketAdapterEvents) {
		this.socket = new WebSocket(url);
		this.socket.addEventListener("open", () => events.onOpen());
		this.socket.addEventListener("close", (e) => events.onClose(e));
		this.socket.addEventListener("error", () => events.onError());
		this.socket.addEventListener("message", (e) => events.onMessage(e));
	}

	public get readyState(): number {
		return this.socket.readyState;
	}

	public send(data: string): void {
		this.socket.send(data);
	}

	public close(): void {
		this.socket.close();
	}
}
