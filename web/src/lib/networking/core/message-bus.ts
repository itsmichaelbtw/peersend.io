import { createLogger } from "@/utils/logger";

const log = createLogger("MessageBus");

export type MessageBusHandler<T = unknown, S = void> = (data: T, context: S) => void | Promise<void>;

export class MessageBus<T extends string, S = void> {
	private handlers: Map<T, MessageBusHandler<unknown, S>[]> = new Map();
	private context: S = undefined as unknown as S;

	public setContext(context: S): void {
		this.context = context;
	}

	public on<D = unknown>(event: T, handler: MessageBusHandler<D, S>): void {
		log.debug(`Registering handler for event: ${event}`);
		if (!this.handlers.has(event)) {
			this.handlers.set(event, []);
		}
		this.handlers.get(event)!.push(handler as MessageBusHandler<unknown, S>);
	}

	public off<D = unknown>(event: T, handler: MessageBusHandler<D, S>): void {
		if (!this.handlers.has(event)) {
			return;
		}

		log.debug(`Unregistering handler for event: ${event}`);
		const handlers = this.handlers
			.get(event)!
			.filter((h) => h !== (handler as MessageBusHandler<unknown, S>));
		this.handlers.set(event, handlers);
	}

	public emit<D = unknown>(event: T, data: D): void {
		if (!this.handlers.has(event)) {
			return;
		}

		for (const handler of this.handlers.get(event)!) {
			try {
				const result = (handler as MessageBusHandler<D, S>)(data, this.context);

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
}
