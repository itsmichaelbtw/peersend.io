import { UAParser } from "ua-parser-js";

interface RTCPeerConnectionConstructor {
	prototype: RTCPeerConnection;
	new (...args: unknown[]): RTCPeerConnection;
}
interface WebRTCCustomWindow extends Window {
	RTCPeerConnection?: RTCPeerConnectionConstructor;
	webkitRTCPeerConnection?: RTCPeerConnectionConstructor;
	mozRTCPeerConnection?: RTCPeerConnectionConstructor;
}

function getRTCPeerConnectionCtor(): RTCPeerConnectionConstructor | undefined {
	if (typeof window === "undefined") {
		return undefined;
	}
	const w = window as WebRTCCustomWindow;
	return w.RTCPeerConnection || w.webkitRTCPeerConnection || w.mozRTCPeerConnection;
}

function hasPeerConnection(): boolean {
	return typeof getRTCPeerConnectionCtor() !== "undefined";
}

function hasDataChannel(): boolean {
	const PC = getRTCPeerConnectionCtor();
	return !!(PC && "createDataChannel" in PC.prototype);
}

export function isBrowserCompatible(): boolean {
	return hasPeerConnection() && hasDataChannel();
}

export function useCompatibility() {
	const ua = new UAParser();
	const browser = ua.getBrowser().name || "unknown";
	const isCompatible = isBrowserCompatible();

	return {
		isCompatible,
		browser
	};
}
