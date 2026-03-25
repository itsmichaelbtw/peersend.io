import React from "react";

import { GITHUB_URL } from "@/components/website/constants";

type Props = {
  onStartSending: () => void;
};

export function HeroSection({ onStartSending }: Props): React.ReactNode {
  return (
    <section className="relative border-b border-gray-200 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #bcc9c6 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.1
        }}
      />
      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <span className="inline-block border border-teal-600/30 text-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 bg-teal-50">
          WebRTC Powered • Zero Storage
        </span>
        <h1 className="font-semibold text-6xl md:text-8xl tracking-tighter text-gray-900 mb-8 leading-[0.9]">
          Files sent. Direct.{" "}
          <span className="text-teal-600 italic">Encrypted.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl mb-12 font-medium">
          PeerSend establishes a WebRTC peer-to-peer channel between you and your recipient. Your
          files bypass our servers entirely.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartSending}
            className="bg-teal-600 text-white px-10 py-5 text-sm font-bold uppercase tracking-widest w-full md:w-auto hover:bg-teal-700 transition-all"
          >
            Start Sending
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border border-gray-500 text-gray-700 px-10 py-5 text-sm font-bold uppercase tracking-widest w-full md:w-auto hover:bg-gray-50 transition-all text-center"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
