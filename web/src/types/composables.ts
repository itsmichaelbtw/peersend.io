export interface UseWebSocketComposable {
  connect(): void;
  disconnect(): void;
  send<T>(data: T): void;
}
