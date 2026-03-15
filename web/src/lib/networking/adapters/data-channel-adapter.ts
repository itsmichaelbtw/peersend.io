export interface DataChannelAdapterEvents {
	onOpen(): void;
	onClose(): void;
	onError(event: RTCErrorEvent): void;
	onMessage(event: MessageEvent): void;
}

export class DataChannelAdapter {
	private readonly channel: RTCDataChannel;

	constructor(channel: RTCDataChannel, events: DataChannelAdapterEvents) {
		this.channel = channel;
		// Firefox defaults binaryType to "blob"; force "arraybuffer" on all
		// browsers so binary file-chunk frames are always delivered as
		// ArrayBuffer and handling is consistent.
		this.channel.binaryType = "arraybuffer";
		this.channel.addEventListener("open", () => events.onOpen());
		this.channel.addEventListener("close", () => events.onClose());
		this.channel.addEventListener("error", (e) => events.onError(e));
		this.channel.addEventListener("message", (e) => events.onMessage(e));
	}

	public get readyState(): RTCDataChannelState {
		return this.channel.readyState;
	}

	public get label(): string {
		return this.channel.label;
	}

	public getDataChannel(): RTCDataChannel {
		return this.channel;
	}

	public send(data: string | ArrayBuffer | Uint8Array): void {
		this.channel.send(data as string);
	}

	public close(): void {
		this.channel.close();
	}
}
