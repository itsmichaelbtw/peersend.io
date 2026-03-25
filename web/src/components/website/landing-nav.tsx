import React from "react";

import { Button } from "@mantine/core";
import { NetworkIcon } from "lucide-react";
import { Link } from "react-router";

export function LandingNav(): React.ReactNode {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-(--mantine-color-default-border) w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter text-(--mantine-color-gray-9)">
          <NetworkIcon size={20} className="text-(--mantine-color-teal-6)" />
          <span>PeerSend</span>
        </div>
        <Button
          renderRoot={(props) => <Link to="/session/create" {...props} />}
          size="sm"
          variant="filled"
          radius={0}
        >
          Open App
        </Button>
      </div>
    </nav>
  );
}

