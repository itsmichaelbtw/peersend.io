import React from "react";

import clsx from "clsx";

import { FEATURES } from "@/components/website/constants";

export function FeaturesGrid(): React.ReactNode {
  return (
    <section className="max-w-[1200px] mx-auto">
      <div className="border-x border-(--mantine-color-default-border)">
        <div className="border-b border-(--mantine-color-default-border) p-10">
          <h2 className="text-3xl font-bold tracking-tight text-(--mantine-color-gray-9)">
            Everything you&apos;d expect. Nothing you don&apos;t.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }, index) => {
            const isLastItem = index === FEATURES.length - 1;
            const isLastInRow = (index + 1) % 3 === 0;
            const isSecondRow = index >= 3;

            return (
              <div
                key={title}
                className={clsx(
                  "p-10 hover:bg-(--mantine-color-gray-0) transition-colors",
                  !isLastItem && "border-b border-(--mantine-color-default-border)",
                  isSecondRow && !isLastItem && "md:border-b-0",
                  !isLastInRow && "border-r border-(--mantine-color-default-border)"
                )}
              >
                <Icon size={28} className="text-(--mantine-color-teal-6) mb-6" />
                <h3 className="font-bold text-lg mb-3 uppercase tracking-tight text-(--mantine-color-gray-9)">
                  {title}
                </h3>
                <p className="text-(--mantine-color-gray-6) text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

