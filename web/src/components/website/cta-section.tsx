import React from "react";

import { ArrowRightIcon } from "lucide-react";

type Props = {
  onStartSending: () => void;
};

export function CtaSection({ onStartSending }: Props): React.ReactNode {
  return (
    <section className="max-w-[1200px] mx-auto border-x border-b border-gray-200">
      <div className="flex flex-col md:flex-row items-stretch">
        <div className="flex-1 p-12 md:p-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-gray-900">
            Ready to share?
          </h2>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-[12px]">
            No account required.
          </p>
        </div>
        <div className="md:w-1/3 flex border-t md:border-t-0 md:border-l border-gray-200">
          <button
            onClick={onStartSending}
            className="w-full bg-teal-600 text-white p-12 text-xl font-bold uppercase tracking-[0.2em] hover:bg-teal-700 transition-all flex items-center justify-center gap-4"
          >
            Start Sending
            <ArrowRightIcon size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
