import { createBrowserRouter, redirect } from "react-router";

import { SessionLayout } from "@/layouts/session-layout";
import { CompatibilityView } from "@/views/compatibility";
import { LandingView } from "@/views/landing";
import { CreateSessionView } from "@/views/session/create-session";
import { JoinSessionView } from "@/views/session/join-session";
import { ActiveSessionView } from "@/views/session/active-session";

import { isBrowserCompatible } from "@/hooks/use-compatibility";
import { appState } from "@/state";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <LandingView />
	},
	{
		path: "/compatibility",
		Component: CompatibilityView
	},
	{
		path: "/session",
		Component: SessionLayout,
		loader(): null {
			if (isBrowserCompatible()) {
				return null;
			}

			throw redirect("/compatibility");
		},
		children: [
			{
				index: true,
				loader(): void {
					throw redirect("/session/create");
				}
			},
			{
				path: "create",
				loader(): void {
					const { sessionState } = appState.get();

					if (sessionState.isConnected && sessionState.sessionCode) {
						throw redirect(`/session/${sessionState.sessionCode}`);
					}
				},
				element: <CreateSessionView />
			},
			{
				path: "join",
				loader(): void {
					const { sessionState } = appState.get();

					if (sessionState.isConnected && sessionState.sessionCode) {
						throw redirect(`/session/${sessionState.sessionCode}`);
					}
				},
				element: <JoinSessionView />
			},
			{
				path: ":session_code",
				loader(): void {
					const { sessionState } = appState.get();

					if (!sessionState.isConnected || sessionState.connectionType === "none") {
						throw redirect("/session/create");
					}
				},
				element: <ActiveSessionView />
			}
		]
	}
]);
