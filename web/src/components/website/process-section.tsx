import React from "react";

import clsx from "clsx";

import { PROCESS_STEPS } from "@/components/website/constants";

export function ProcessSection(): React.ReactNode {
  return (
    <>
      <section className="max-w-[1200px] mx-auto border-x border-b border-(--mantine-color-default-border)">
        <div className="p-10">
          <h2 className="text-3xl font-bold tracking-tight text-(--mantine-color-gray-9)">
            The technical path to privacy
          </h2>
        </div>
      </section>
      <section className="max-w-[1200px] mx-auto border-x border-b border-(--mantine-color-default-border)">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-48 p-8 border-b md:border-b-0 md:border-r border-(--mantine-color-default-border) flex items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-(--mantine-color-teal-6)">
              Process
            </span>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3">
            {PROCESS_STEPS.map((item, index) => (
              <div
                key={item.step}
                className={clsx(
                  "p-8",
                  index < PROCESS_STEPS.length - 1 &&
                    "border-b md:border-b-0 md:border-r border-(--mantine-color-default-border)"
                )}
              >
                <div className="font-mono text-(--mantine-color-teal-6) text-xs font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="font-bold mb-2 uppercase tracking-tight text-sm text-(--mantine-color-gray-9)">
                  {item.title}
                </h4>
                <p className="text-(--mantine-color-gray-6) text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

