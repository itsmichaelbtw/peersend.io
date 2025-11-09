import React from "react";

import { createBrowserRouter, redirect } from "react-router";

import { MainLayout } from "@/components/layouts/main-layout";
import { SessionLayout } from "@/components/layouts/session-layout";
import { CompatibilityView } from "@/components/views/compatiblity";
import { CreateSessionView } from "@/components/views/session/create-session";
import { JoinSessionView } from "@/components/views/session/join-session";
import { ActiveSessionView } from "@/components/views/session/active-session";

import { isBrowserCompatible } from "@/hooks/use-compatibility";
import { appState } from "@/state";

export const router = createBrowserRouter([
	{
		path: "/",
		Component: MainLayout,
		children: [
			{
				index: true,
				Component(): React.ReactNode {
					return <div>Home Page</div>;
				}
			}
		]
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
