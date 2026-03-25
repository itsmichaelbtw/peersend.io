import React from "react";

import { Button } from "@mantine/core";
import { Link } from "react-router";

import { GITHUB_URL } from "@/components/website/constants";

export function HeroSection(): React.ReactNode {
  return (
    <section className="relative border-b border-(--mantine-color-default-border) overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--mantine-color-teal-2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.5
        }}
      />
      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <span className="inline-block border border-(--mantine-color-teal-6)/30 text-(--mantine-color-teal-7) px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 bg-(--mantine-color-teal-0)">
          WebRTC Powered • Zero Storage
        </span>
        <h1 className="font-semibold text-6xl md:text-8xl tracking-tighter text-(--mantine-color-gray-9) mb-8 leading-[0.9]">
          Files sent. Direct.{" "}
          <span className="text-(--mantine-color-teal-6) italic">Encrypted.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-(--mantine-color-gray-6) text-lg md:text-xl mb-12 font-medium">
          PeerSend establishes a WebRTC peer-to-peer channel between you and your recipient. Your
          files bypass our servers entirely.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button
            renderRoot={(props) => <Link to="/session/create" {...props} />}
            size="xl"
            variant="filled"
            radius={0}
            className="w-full md:w-auto"
          >
            Start Sending
          </Button>
          <Button
            component="a"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="xl"
            variant="outline"
            radius={0}
            color="gray"
            className="w-full md:w-auto"
          >
            View on GitHub →
          </Button>
        </div>
      </div>
    </section>
  );
}

