import { createLogger } from "@/utils/logger";

const log = createLogger("MessageBus");

export type MessageBusHandler<T = unknown> = (data: T) => void | Promise<void>;

export class MessageBus<T extends string> {
	private handlers: Map<T, MessageBusHandler<unknown>[]> = new Map();

	public on<D = unknown>(event: T, handler: MessageBusHandler<D>): void {
		log.debug(`Registering handler for event: ${event}`);
		if (!this.handlers.has(event)) {
			this.handlers.set(event, []);
		}
		this.handlers.get(event)!.push(handler as MessageBusHandler<unknown>);
	}

	public off<D = unknown>(event: T, handler: MessageBusHandler<D>): void {
		if (!this.handlers.has(event)) {
			return;
		}

		log.debug(`Unregistering handler for event: ${event}`);
		const handlers = this.handlers
			.get(event)!
			.filter((h) => h !== (handler as MessageBusHandler<unknown>));
		this.handlers.set(event, handlers);
	}

	public emit<D = unknown>(event: T, data: D): void {
		if (!this.handlers.has(event)) {
			return;
		}

		for (const handler of this.handlers.get(event)!) {
			try {
				const result = (handler as MessageBusHandler<D>)(data);

				if (result instanceof Promise) {
					result.catch((error: unknown) => {
						log.error(`Async error in handler for event: ${event}`, error);
					});
				}
			} catch (error) {
				log.error(`Error in handler for event: ${event}`, error);
			}
		}
	}

	public createEmitter<D = unknown>(event: T): (data: D) => void {
		return (data: D) => {
			return this.emit(event, data);
		};
	}
}
