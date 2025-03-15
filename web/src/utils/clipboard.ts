export function copyToClipboard(text: string): Promise<boolean>;
export function copyToClipboard(text: string, callback: (success: boolean) => void): void;
export function copyToClipboard(
  text: string,
  callback?: (success: boolean) => void
): Promise<boolean> | void {
  const copyPromise = navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });

  if (callback) {
    copyPromise.then(callback);
  } else {
    return copyPromise;
  }
}
