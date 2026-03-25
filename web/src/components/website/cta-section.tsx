import React from "react";

import { Button } from "@mantine/core";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

export function CtaSection(): React.ReactNode {
  return (
    <section className="max-w-[1200px] mx-auto border-x border-b border-(--mantine-color-default-border)">
      <div className="flex flex-col md:flex-row items-stretch">
        <div className="flex-1 p-12 md:p-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-(--mantine-color-gray-9)">
            Ready to share?
          </h2>
          <p className="text-(--mantine-color-gray-5) font-medium uppercase tracking-widest text-[12px]">
            No account required.
          </p>
        </div>
        <div className="md:w-1/3 flex border-t md:border-t-0 md:border-l border-(--mantine-color-default-border)">
          <Button
            renderRoot={(props) => <Link to="/session/create" {...props} />}
            variant="filled"
            radius={0}
            size="xl"
            fullWidth
            className="h-full text-xl tracking-[0.2em] p-12"
            rightSection={<ArrowRightIcon size={20} />}
          >
            Start Sending
          </Button>
        </div>
      </div>
    </section>
  );
}

