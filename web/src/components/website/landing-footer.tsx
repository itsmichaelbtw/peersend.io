import React from "react";

export function LandingFooter(): React.ReactNode {
  return (
    <footer className="bg-white max-w-[1200px] mx-auto px-6 py-8 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
      <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">PeerSend</div>
      <div className="flex gap-8 text-xs tracking-widest uppercase text-gray-400">
        <a
          href="/privacy"
          className="hover:text-teal-600 underline decoration-1 underline-offset-4 transition-colors"
        >
          Privacy Policy
        </a>
        <a
          href="/terms"
          className="hover:text-teal-600 underline decoration-1 underline-offset-4 transition-colors"
        >
          Terms
        </a>
      </div>
      <div className="text-xs tracking-widest uppercase text-gray-400">© 2025 PeerSend.io</div>
    </footer>
  );
}
