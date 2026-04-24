import "./assets/css/tailwind.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./router";

// eslint-disable-next-line no-console
console.log(`peersend.io v${__APP_VERSION__} — ${__GITHUB_URL__}`);

const root = document.getElementById("root")!;

createRoot(root).render(
	<StrictMode>
		<HelmetProvider>
			<TooltipProvider skipDelayDuration={0} delayDuration={200}>
				<RouterProvider router={router} />
				<Toaster position="top-right" />
			</TooltipProvider>
		</HelmetProvider>
	</StrictMode>
);
