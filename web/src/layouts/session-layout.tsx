import type { ConnectionErrorData } from "@/state/types";

import React, { useEffect } from "react";

import { Outlet } from "react-router";
import { toast } from "sonner";
import { appState } from "@/state";
import { useAppState } from "@/hooks/use-app-state";
import { capitalise } from "@/utils/capitalise";
import { teardownSession } from "@/lib/networking/session-teardown";

export function SessionLayout(): React.ReactNode {
	const { sessionState } = useAppState();

	function handleLastError(lastError: ConnectionErrorData): void {
		appState.dispatch("SET_LAST_ERROR", null);
		toast.error(lastError.title, {
			id: lastError.title,
			description: capitalise(lastError.message),
			position: "top-right"
		});
	}

	useEffect(() => {
		if (sessionState.lastError) {
			handleLastError(sessionState.lastError);
		}
	}, [sessionState.lastError]);

	useEffect(() => {
		return (): void => {
			teardownSession();
		};
	}, []);

	return (
		<React.Fragment>
			<main className="mx-auto z-0 bg-secondary/30">
				<div className="min-h-screen w-full relative">
					<div
						className={[
							"absolute inset-0 z-0",
							"bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)]",
							"bg-size-[20px_20px]",
							"mask-[repeating-linear-gradient(to_right,black_0px,black_3px,transparent_3px,transparent_8px),repeating-linear-gradient(to_bottom,black_0px,black_3px,transparent_3px,transparent_8px)]",
							"[-webkit-mask-image:repeating-linear-gradient(to_right,black_0px,black_3px,transparent_3px,transparent_8px),repeating-linear-gradient(to_bottom,black_0px,black_3px,transparent_3px,transparent_8px)]",
							"mask-intersect",
							"[-webkit-mask-composite:source-in]"
						].join(" ")}
					/>
					<div className="min-h-screen flex flex-col items-center justify-center max-w-6xl gap-4 mx-auto sm:py-12 py-6 sm:px-6 relative">
						<Outlet />
					</div>
				</div>
			</main>
		</React.Fragment>
	);
}
