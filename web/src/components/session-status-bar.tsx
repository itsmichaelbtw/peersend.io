import React from "react";

import { CopyIcon, WifiIcon, RouterIcon, CrownIcon, CopyCheckIcon } from "lucide-react";
import { Badge, Box, Button, CopyButton, Tooltip } from "@mantine/core";
import { useAppState } from "@/hooks/use-app-state";
import { getWebSocketClient } from "@/lib/networking/client-registry";

export function SessionStatusBar(): React.ReactNode {
	const { sessionState } = useAppState();

	return (
		<Box w="100%" display="flex" className="items-center justify-between select-none">
			<Box display="flex" className="items-center justify-between gap-x-2">
				{sessionState.sessionCode !== null && (
					<CopyButton value={sessionState.sessionCode}>
						{({ copy, copied }) => (
							<Tooltip label={copied ? "Copied!" : "Copy session code"}>
								<Button
									onClick={copy}
									variant="subtle"
									size="sm"
									color={copied ? "teal" : "gray"}
									rightSection={copied ? <CopyCheckIcon size={20} /> : <CopyIcon size={20} />}
								>
									<span className="inline-block align-middle font-mono text-base">
										{sessionState.sessionCode!}
									</span>
								</Button>
							</Tooltip>
						)}
					</CopyButton>
				)}
				{sessionState.connectionType === "websocket" && (
					<Badge
						radius="md"
						size="md"
						variant="light"
						color="gray"
						leftSection={<WifiIcon size={14} />}
					>
						<span className="font-medium">Server Connection</span>
					</Badge>
				)}
				{sessionState.connectionType === "webrtc" && (
					<Badge
						radius="md"
						size="md"
						variant="light"
						color="teal"
						leftSection={<RouterIcon size={14} />}
					>
						<span className="font-medium">Direct Connection</span>
					</Badge>
				)}
			</Box>

			{sessionState.isHost && sessionState.clients.length > 1 ? (
				<Button
					leftSection={<CrownIcon size={16} />}
					size="sm"
					color="dark"
					onClick={() => {
						const ws = getWebSocketClient();
						ws.emit({ type: "transfer_host", data: null });
					}}
				>
					Transfer Host
				</Button>
			) : null}
		</Box>
	);
}
