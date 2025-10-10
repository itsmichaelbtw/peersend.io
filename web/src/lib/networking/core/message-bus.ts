export type MessageBusHandler<T = any> = (data: T) => void;

export class MessageBus<T extends string> {
  private handlers: Map<T, MessageBusHandler[]> = new Map();

  public on<D = any>(event: T, handler: MessageBusHandler<D>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event as T, []);
    }
    this.handlers.get(event as T)!.push(handler);
  }

  public off<D = any>(event: T, handler: MessageBusHandler<D>): void {
    if (!this.handlers.has(event)) {
      return;
    }

    const handlers = this.handlers.get(event)!.filter((h) => h !== handler);
    this.handlers.set(event, handlers);
  }

  public emit<D = any>(event: T, data: D): void {
    if (!this.handlers.has(event)) {
      return;
    }

    for (const handler of this.handlers.get(event)!) {
      try {
        handler(data);
      } catch (error) {
        console.log("there was a problem when handling an emitter");
      }
    }
  }

  public create_emitter<D = any>(event: T): (data: D) => void {
    return (data: D) => {
      return this.emit(event, data);
    };
  }
}
