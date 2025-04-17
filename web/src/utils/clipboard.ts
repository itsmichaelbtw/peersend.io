interface Callback {
  onSuccess?(): void;
  onError?(): void;
}

export function copyToClipboard(text: string, callback: Callback = {}): void {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        callback.onSuccess?.();
      })
      .catch(() => {
        callback.onError?.();
      });
  } else {
    callback.onError?.();
  }
}
