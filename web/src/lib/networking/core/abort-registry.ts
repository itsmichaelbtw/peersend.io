type Tasks = Map<string, AbortController>;

class AbortRegistry {
  private globalAbort: AbortController | null = null;
  private tasks: Tasks = new Map();

  private onAbort(): void {
    for (const controller of this.tasks.values()) {
      controller.abort();
    }

    this.tasks.clear();
    this.globalAbort = null;
  }

  public start(): void {
    if (!!this.globalAbort) {
      return;
    }

    this.globalAbort = new AbortController();
    this.globalAbort.signal.addEventListener("abort", this.onAbort.bind(this));
  }

  public end(): void {
    if (!this.globalAbort) {
      return;
    }

    this.globalAbort.abort();
  }

  public register(id: string): AbortSignal {
    if (!this.globalAbort) {
      throw new Error("No active session exists");
    }

    const controller = new AbortController();
    this.tasks.set(id, controller);
    return controller.signal;
  }

  public abort(id: string): void {
    const controller = this.tasks.get(id);

    if (!controller) {
      return;
    }

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
