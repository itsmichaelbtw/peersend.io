import { createLogger } from "@/utils/logger";

const log = createLogger("MessageBus");

export type MessageBusHandler<T = any> = (data: T) => void;

export class MessageBus<T extends string> {
	private handlers: Map<T, MessageBusHandler[]> = new Map();

	public on<D = any>(event: T, handler: MessageBusHandler<D>): void {
		log.debug(`Registering handler for event: ${event}`);
		if (!this.handlers.has(event)) {
			this.handlers.set(event as T, []);
		}
		this.handlers.get(event as T)!.push(handler);
	}

	public off<D = any>(event: T, handler: MessageBusHandler<D>): void {
		if (!this.handlers.has(event)) {
			return;
		}

		log.debug(`Unregistering handler for event: ${event}`);
		const handlers = this.handlers.get(event)!.filter((h) => h !== handler);
		this.handlers.set(event, handlers);
	}

	public emit<D = any>(event: T, data: D): void {
		if (!this.handlers.has(event)) {
			return;
		}

		const handlers = this.handlers.get(event);
		log.info(`Emitting event: ${event} to ${handlers?.length} handlers`);

		for (const handler of handlers!) {
			try {
				handler(data);
			} catch (error) {
				log.error(`Error in handler for event: ${event}`, error);
			}
		}
	}

	public create_emitter<D = any>(event: T): (data: D) => void {
		return (data: D) => {
			return this.emit(event, data);
		};
	}
}
