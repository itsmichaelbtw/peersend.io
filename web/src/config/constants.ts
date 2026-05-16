import type { SessionState, WebRTCConnectionState, WebSocketConnectionState } from "@/state";
import type { EnvironmentVariables } from "@/types/env";

import React, { type ForwardRefExoticComponent } from "react";

import {
	ClockIcon,
	GlobeIcon,
	HeartHandshakeIcon,
	LockIcon,
	ServerIcon,
	ZapIcon,
	type LucideProps
} from "lucide-react";

import ChromeSVG from "@/assets/svg/chrome.svg?react";
import FirefoxSVG from "@/assets/svg/firefox.svg?react";
import SafariSVG from "@/assets/svg/safari.svg?react";
import EdgeSVG from "@/assets/svg/microsoft-edge.svg?react";

interface WebsiteFeature {
	Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
	title: string;
	description: string;
	subDescription: string;
}

interface WebsiteStat {
	value: string;
	label: string;
}

interface WebsiteProcessStep {
	step: string;
	title: string;
	description: string;
}

interface WebsiteFAQItem {
	question: string;
	answer: string;
}

interface WebsiteBrowserEntry {
	name: string;
	Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

export const envVar: EnvironmentVariables = {
	SESSION_CODE_EXAMPLE: (import.meta.env.VITE_SESSION_CODE_EXAMPLE as string) || "X-BG74DT",
	SESSION_CODE_LENGTH: 5,
	WEBSOCKET_ENDPOINT: import.meta.env.VITE_SERVER_ENDPOINT as string,
	NODE_ENV: import.meta.env.MODE || "development",
	IS_DEVELOPMENT: import.meta.env.DEV,
	IS_PRODUCTION: import.meta.env.PROD,
	LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL as string) || "info"
};

export const DEFAULT_WEBSOCKET_STATE: WebSocketConnectionState = {
	ws: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_WEBRTC_STATE: WebRTCConnectionState = {
	dataChannel: null,
	isConnected: false,
	isConnecting: false
};

export const DEFAULT_SESSION_STATE: SessionState = {
	sessionCode: null,
	clients: [],
	isHost: false,
	isConnected: false,
	autoWebRTC: false,
	fileTransferCapacity: 0,
	clientId: null,
	maximumClients: 0,
	encryptionMode: "none",
	connectionType: "none"
};

export const WEBSITE_GITHUB_URL: string = __GITHUB_URL__;
export const APP_VERSION: string = __APP_VERSION__;

export const WEBSITE_FEATURES: readonly WebsiteFeature[] = [
	{
		Icon: LockIcon,
		title: "End-to-End Encrypted",
		description: "WebRTC encryption ensures zero third-party access to your data streams.",
		subDescription: "Your files stay private"
	},
	{
		Icon: ServerIcon,
		title: "Zero Server Storage",
		description:
			"We have no record of your files. They never touch our disk, only our signaling pipe.",
		subDescription: "No server storage"
	},
	{
		Icon: ClockIcon,
		title: "30-Minute Sessions",
		description: "Temporary by design. Sessions auto-expire if no connection is established.",
		subDescription: "Sessions expire after 30 minutes"
	},
	{
		Icon: ZapIcon,
		title: "Instant Transfer",
		description: "No upload queue. Transfer starts the moment you connect to the recipient.",
		subDescription: "Transfer starts immediately"
	},
	{
		Icon: HeartHandshakeIcon,
		title: "Private by Default",
		description: "No accounts, no tracking, no analytics. Your identity remains yours alone.",
		subDescription: "No accounts or tracking"
	},
	{
		Icon: GlobeIcon,
		title: "Any Device",
		description: "Works in any modern browser — desktop, mobile, or tablet with zero install.",
		subDescription: "Works on any modern browser"
	}
];

export const WEBSITE_STATS: readonly WebsiteStat[] = [
	{ value: "8,400+", label: "Files transferred" },
	{ value: "94 GB+", label: "Data sent peer-to-peer" },
	{ value: "0 bytes", label: "Stored on our servers" },
	{ value: "1,200+", label: "Sessions created" }
];

export const WEBSITE_PROCESS_STEPS: readonly WebsiteProcessStep[] = [
	{
		step: "01.",
		title: "Create Session",
		description: "Click 'Start Sending' and receive a unique session code for your browser."
	},
	{
		step: "02.",
		title: "Share Code",
		description: "Send the code to your recipient via any secure messaging channel."
	},
	{
		step: "03.",
		title: "Transfer Files",
		description: "Connect directly and send up to 500MB per transfer instantly."
	}
];

export const WEBSITE_FAQ_ITEMS: readonly WebsiteFAQItem[] = [
	{
		question: "Do you store my files?",
		answer:
			"No. Your files never touch our servers. PeerSend establishes a direct browser-to-browser connection, so data moves only between you and your recipient."
	},
	{
		question: "Is there a file size limit?",
		answer:
			"Transfers are capped at 500MB per session. Because files are streamed through the browser directly, the practical limit is tied to your device's available memory."
	},
	{
		question: "Does the tab need to stay open?",
		answer:
			"Yes. Your browser acts as the host for the session. Closing the tab ends the connection immediately and any in-progress transfer will stop."
	},
	{
		question: "Is the transfer encrypted?",
		answer:
			"Yes. All transfers use WebRTC's built-in DTLS-SRTP encryption — the same standard used for secure video calls — so only you and your recipient can read the data."
	}
];

export const WEBSITE_BROWSER_ENTRIES: readonly WebsiteBrowserEntry[] = [
	{ name: "Chrome", Svg: ChromeSVG },
	{ name: "Firefox", Svg: FirefoxSVG },
	{ name: "Safari", Svg: SafariSVG },
	{ name: "Edge", Svg: EdgeSVG }
];
