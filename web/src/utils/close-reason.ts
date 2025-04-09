export function wsCloseReason(message: string) {
  return {
    isSessionFull() {
      return message.includes("session is full");
    }
  };
}
