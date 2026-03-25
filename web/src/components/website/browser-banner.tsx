import React from "react";

import { BROWSERS } from "@/components/website/constants";

export function BrowserBanner(): React.ReactNode {
  return (
    <section className="w-full border-b border-gray-200 bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-8">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Works in all modern browsers
        </span>
        <div className="flex items-center gap-12 opacity-40 grayscale">
          {BROWSERS.map((browser) => (
            <div key={browser} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-700" />
              <span className="text-xs font-bold uppercase tracking-tight text-gray-900">
                {browser}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
