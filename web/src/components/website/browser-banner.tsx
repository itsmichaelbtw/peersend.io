import React from "react";

import { GlobeIcon } from "lucide-react";
import { siGooglechrome, siFirefoxbrowser, siSafari } from "simple-icons";

type BrowserEntry = {
  name: string;
  path: string | null;
};

const BROWSER_ENTRIES: BrowserEntry[] = [
  { name: "Chrome", path: siGooglechrome.path },
  { name: "Firefox", path: siFirefoxbrowser.path },
  { name: "Safari", path: siSafari.path },
  { name: "Edge", path: null }
];

export function BrowserBanner(): React.ReactNode {
  return (
    <section className="w-full border-b border-(--mantine-color-default-border) bg-(--mantine-color-gray-0)">
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-8">
        <span className="text-xs font-bold uppercase tracking-widest text-(--mantine-color-gray-5)">
          Works in all modern browsers
        </span>
        <div className="flex items-center gap-10 opacity-40 grayscale">
          {BROWSER_ENTRIES.map(({ name, path }) => (
            <div key={name} className="flex items-center gap-2">
              {path ? (
                <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
                  <path d={path} />
                </svg>
              ) : (
                <GlobeIcon size={18} />
              )}
              <span className="text-xs font-bold uppercase tracking-tight text-(--mantine-color-gray-9)">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

