import {
  ClockIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  LockIcon,
  ServerIcon,
  ZapIcon
} from "lucide-react";

import type { FaqItem, Feature, ProcessStep, Stat } from "@/components/website/types";

export const GITHUB_URL = "https://github.com/peersend-io/peersend";

export const FEATURES: Feature[] = [
  {
    Icon: LockIcon,
    title: "End-to-End Encrypted",
    description: "WebRTC encryption ensures zero third-party access to your data streams."
  },
  {
    Icon: ServerIcon,
    title: "Zero Server Storage",
    description: "We have no record of your files. They never touch our disk, only our signaling pipe."
  },
  {
    Icon: ClockIcon,
    title: "30-Minute Sessions",
    description: "Temporary by design. Sessions auto-expire if no connection is established."
  },
  {
    Icon: ZapIcon,
    title: "Instant Transfer",
    description: "No upload queue. Transfer starts the moment you connect to the recipient."
  },
  {
    Icon: HeartHandshakeIcon,
    title: "Private by Default",
    description: "No accounts, no tracking, no analytics. Your identity remains yours alone."
  },
  {
    Icon: GlobeIcon,
    title: "Any Device",
    description: "Works in any modern browser — desktop, mobile, or tablet with zero install."
  }
];

export const STATS: Stat[] = [
  { value: "500 MB", label: "Max file size" },
  { value: "30 min", label: "Session lifetime" },
  { value: "0 bytes", label: "Server storage" },
  { value: "100%", label: "Encrypted" }
];

export const PROCESS_STEPS: ProcessStep[] = [
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

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How is this different from Dropbox?",
    answer:
      "Unlike Dropbox, we never store your files. We only facilitate a direct connection between you and your recipient. Once the browser closes, the path is gone forever."
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Currently, we support transfers up to 500MB. Because the data is streamed directly through the browser's memory, larger files are limited by your device's available RAM."
  },
  {
    question: "Does the browser need to stay open?",
    answer:
      "Yes. Since there is no intermediary server, your browser acts as the host. If you close the tab, the connection is severed and the transfer will stop immediately."
  },
  {
    question: "What about security?",
    answer:
      "We use WebRTC's native DTLS-SRTP encryption. This is the same industry-standard security used for secure video calls, ensuring only you and your recipient can see the data."
  }
];
