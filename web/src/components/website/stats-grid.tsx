import React from "react";

import { STATS } from "@/components/website/constants";

export function StatsGrid(): React.ReactNode {
  return (
    <section className="max-w-[1200px] mx-auto border-x border-(--mantine-color-default-border)">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={[
              "text-center p-10 border-b border-(--mantine-color-default-border)",
              index < STATS.length - 1
                ? "border-r border-(--mantine-color-default-border)"
                : ""
            ].join(" ")}
          >
            <div className="text-4xl font-black text-(--mantine-color-gray-9) mb-2">
              {stat.value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--mantine-color-gray-5)">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

