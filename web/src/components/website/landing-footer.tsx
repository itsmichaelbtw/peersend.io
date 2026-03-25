import React from "react";

import { Anchor } from "@mantine/core";

export function LandingFooter(): React.ReactNode {
  return (
    <footer className="bg-white max-w-[1200px] mx-auto px-6 py-8 border-t border-(--mantine-color-default-border) flex flex-wrap justify-between items-center gap-4">
      <div className="text-sm font-black text-(--mantine-color-gray-9) uppercase tracking-tighter">
        PeerSend
      </div>
      <div className="flex gap-8">
        <Anchor
          href="/privacy"
          size="xs"
          c="dimmed"
          className="uppercase tracking-widest underline-offset-4"
        >
          Privacy Policy
        </Anchor>
        <Anchor
          href="/terms"
          size="xs"
          c="dimmed"
          className="uppercase tracking-widest underline-offset-4"
        >
          Terms
        </Anchor>
      </div>
      <div className="text-xs tracking-widest uppercase text-(--mantine-color-gray-5)">
        © 2025 PeerSend.io
      </div>
    </footer>
  );
}

