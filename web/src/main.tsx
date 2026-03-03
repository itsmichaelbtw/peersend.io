import "./assets/css/tailwind.css";
import "./assets/css/fonts.css";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ConnectionUpgrade } from "./components/collaboration";

const root = document.getElementById("root")!;

const modals = {
	initiateDirectConnection: ConnectionUpgrade
};

declare module "@mantine/modals" {
	export interface MantineModalsOverride {
		modals: typeof modals;
	}
}

createRoot(root).render(
	<StrictMode>
		<MantineProvider
			withCssVariables
			forceColorScheme="light"
			theme={{
				primaryColor: "teal",
				fontFamily: "Geist"
			}}
		>
			<ModalsProvider modals={modals}>
				<Notifications />
				<RouterProvider router={router} />
			</ModalsProvider>
		</MantineProvider>
	</StrictMode>
);
