export class FileBytesStore {
  private store = new Map<string, Uint8Array>();

  public set(id: string, bytes: Uint8Array) {
    this.store.set(id, bytes);
  }

  public get(id: string): Uint8Array | undefined {
    return this.store.get(id);
  }

  public has(id: string): boolean {
    return this.store.has(id);
  }

  public delete(id: string) {
    this.store.delete(id);
  }

  public clear() {
    this.store.clear();
  }
}

export const fileBytesStore = new FileBytesStore();
