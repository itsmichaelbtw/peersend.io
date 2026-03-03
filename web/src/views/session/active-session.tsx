import React, { useState } from "react";

import { TriangleAlertIcon } from "lucide-react";
import { Alert } from "@mantine/core";
import { useAppState } from "@/hooks/use-app-state";

import { SessionStatusBar } from "@/components/session-status-bar";
import { ConnectionStatus } from "@/components/connection-status";
import { Collaboration } from "@/components/collaboration";

export function ActiveSessionView(): React.ReactNode {
	const { sessionState } = useAppState();

	const [showAlert, setShowAlert] = useState(true);

	if (!sessionState.isConnected || sessionState.connectionType === "none") {
		return <p>You are not connected</p>;
	}

	return (
		<React.Fragment>
			{showAlert && (
				<Alert
					icon={<TriangleAlertIcon />}
					color="yellow"
					className="w-full select-none"
					closeButtonLabel="Dismiss"
					autoContrast
					withCloseButton
					onClose={() => {
						setShowAlert(false);
					}}
				>
					<span className="text-(--mantine-color-yellow-text)">
						All received files will be lost when you close this tab or browser. Download any files
						you want to keep.
					</span>
				</Alert>
			)}

			<SessionStatusBar />

			<div className="relative w-full grid grid-cols-3 gap-4">
				<div className="col-span-1 space-y-4">
					<ConnectionStatus />
				</div>

				<div className="col-span-2">
					<Collaboration />
				</div>
			</div>
		</React.Fragment>
	);
}
