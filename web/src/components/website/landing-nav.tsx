import React from "react";

import { NetworkIcon } from "lucide-react";

type Props = {
  onOpenApp: () => void;
};

export function LandingNav({ onOpenApp }: Props): React.ReactNode {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter text-gray-900">
          <NetworkIcon size={20} className="text-teal-600" />
          <span>PeerSend</span>
        </div>
        <button
          onClick={onOpenApp}
          className="bg-teal-600 text-white px-6 py-2 text-sm font-medium uppercase tracking-wider hover:bg-teal-700 transition-colors duration-150"
        >
          Open App
        </button>
      </div>
    </nav>
  );
}
