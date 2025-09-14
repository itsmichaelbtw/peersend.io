import { useState, useEffect } from "react";
import { UAParser } from "ua-parser-js";

function hasPeerConnection(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const w = window as any;

  return Boolean(w.RTCPeerConnection || w.webkitRTCPeerConnection || w.mozRTCPeerConnection);
}

function hasDataChannel(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const w = window as any;
  const PC = w.RTCPeerConnection || w.webkitRTCPeerConnection || w.mozRTCPeerConnection;

  return Boolean(PC && PC.prototype && "createDataChannel" in PC.prototype);
}

export function isBrowserCompatible(): boolean {
  return hasPeerConnection() && hasDataChannel();
}

export function useCompatibility() {
  const [isChecking, setIsChecking] = useState(true);
  const [isCompatible, setIsCompatible] = useState(true);
  const [browser, setBrowser] = useState("unknown");

  useEffect(() => {
    const ua = new UAParser();
    setBrowser(ua.getBrowser().name || "unknown");

    setIsCompatible(isBrowserCompatible());
    setIsChecking(false);
  }, []);

  return { isChecking, isCompatible, browser };
}
