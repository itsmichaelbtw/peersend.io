import { createLogger } from "@/utils/logger";

const log = createLogger("AbortRegistry");

type Tasks = Map<string, AbortController>;

class AbortRegistry {
	private globalAbort: AbortController | null = null;
	private tasks: Tasks = new Map();

	private onAbort(): void {
		log.info("Aborting all tasks in the registry");

		for (const controller of this.tasks.values()) {
			controller.abort();
		}

		this.tasks.clear();
		this.globalAbort = null;
	}

	public start(): void {
		if (this.globalAbort) {
			return;
		}

		log.info("Starting a new abort registry session");

		this.globalAbort = new AbortController();
		this.globalAbort.signal.addEventListener("abort", this.onAbort.bind(this));
	}

	public end(): void {
		if (!this.globalAbort) {
			return;
		}

		log.info("Ending the current abort registry session");
		this.globalAbort.abort();
	}

	public register(id: string): AbortSignal {
		if (!this.globalAbort) {
			throw new Error("No active session exists");
		}

		log.debug(`Registering task with id: ${id}`);
		const controller = new AbortController();
		this.tasks.set(id, controller);
		return controller.signal;
	}

	public getSignal(id: string): AbortSignal | null {
		return this.tasks.get(id)?.signal ?? null;
	}

	public abort(id: string): void {
		const controller = this.tasks.get(id);

		if (!controller) {
			return;
		}

		log.debug(`Aborting task with id: ${id}`);
		controller.abort();
		this.tasks.delete(id);
	}

	public isActive(id: string): boolean {
		const controller = this.tasks.get(id);

		if (!controller) {
			return false;
		}

		return !!controller && !controller.signal.aborted;
	}
}

export const abortRegistry = new AbortRegistry();
