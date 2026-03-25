import React from "react";

import { FAQ_ITEMS } from "@/components/website/constants";

export function FaqSection(): React.ReactNode {
  return (
    <section className="max-w-[1200px] mx-auto border-x border-b border-(--mantine-color-default-border) bg-(--mantine-color-dark-7) text-white">
      <div className="p-12 md:p-20 max-w-3xl mx-auto flex flex-col justify-center min-h-[600px]">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 border-b border-white/10 pb-8">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="space-y-12">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <h4 className="font-bold text-lg mb-4 text-white">{item.question}</h4>
              <p className="text-(--mantine-color-dark-2) text-sm leading-relaxed max-w-2xl">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

