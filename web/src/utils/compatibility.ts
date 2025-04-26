const win: any = window as any;

export function hasPeerConnection(): boolean {
  if (typeof win === "undefined") {
    return false;
  }

  return !!(
    win["RTCPeerConnection"] ||
    win["webkitRTCPeerConnection"] ||
    win["mozRTCPeerConnection"]
  );
}

export function hasDataChannel(): boolean {
  if (typeof win === "undefined") {
    return false;
  }

  return !!win["RTCPeerConnection"] && "createDataChannel" in win["RTCPeerConnection"].prototype;
}

export function checkWebRTCCompatibility() {
  return hasPeerConnection() && hasDataChannel();
}
