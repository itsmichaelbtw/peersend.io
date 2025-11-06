import type { ContextModalProps } from "@mantine/modals";

import React from "react";

import { ArrowUpFromLineIcon, LockIcon, RouterIcon, ShieldIcon } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { Button, Group, Stack, Box, Loader } from "@mantine/core";
import { getWebRTCClient } from "@/lib/networking/utils";

export function ConnectionUpgrade({ id, context }: ContextModalProps) {
	const { sessionState, webrtcState } = useAppState();

	return (
		<React.Fragment>
			{!webrtcState.isConnected && (
				<div>
					<span className="leading-snug text-gray-500">
						To transfer files securely between peers, we need to upgrade your connection
					</span>
				</div>
			)}

			<Box my="lg">
				{webrtcState.isConnected ? (
					<Stack gap="xs">
						<div className="flex w-fit mx-auto items-center justify-center rounded-full bg-green-100 p-4">
							<RouterIcon size={36} className="text-green-600" />
						</div>
						<div className="text-center space-y-1">
							<h3 className="text-lg font-medium">Connection Upgraded Successfully!</h3>
							<p className="text-gray-500 text-sm">
								You&apos;re now connected via WebRTC and can transfer files up to 500MB in size.
							</p>
						</div>
					</Stack>
				) : webrtcState.isConnecting ? (
					<Stack gap="xs" align="center">
						<h3 className="text-lg font-medium">Establishing WebRTC Connection</h3>
						<Loader type="dots" size="md" />
						<p className="text-xs text-gray-500">Do not close this dialog</p>
					</Stack>
				) : (
					<Stack gap="xs">
						<Box p="md" className="rounded-lg border-2 border-blue-200 bg-blue-50">
							<Group gap="md" align="center" justify="flex-start" wrap="nowrap">
								<ArrowUpFromLineIcon size={30} className="text-blue-500" />
								<div>
									<h3 className="font-medium text-blue-800">Connection Upgrade Process</h3>
									<p className="text-sm text-blue-700">
										This is a one-time process that takes just a few seconds to complete
									</p>
								</div>
							</Group>
						</Box>

						{sessionState.encryptionMode !== "none" && (
							<Box p="md" className="rounded-lg border-2 border-gray-200 bg-gray-50">
								<Group gap="md" align="center" justify="flex-start" wrap="nowrap">
									<ShieldIcon size={30} />
									<div>
										<h3 className="font-medium">Enchanced Security</h3>
										<p className="text-sm text-gray-500">
											WebRTC provides end-to-end encryption for your file transfers
										</p>
									</div>
								</Group>
							</Box>
						)}

						<Box p="md" className="rounded-lg border-2 border-gray-200 bg-gray-50">
							<Group gap="md" align="center" justify="flex-start" wrap="nowrap">
								<LockIcon size={30} className="text-[var(--mantine-color-teal-5)]" />
								<div>
									<h3 className="font-medium">Direct Peer-to-Peer</h3>
									<p className="text-sm text-gray-500">
										Files are transferred directly between devices, not through our servers
									</p>
								</div>
							</Group>
						</Box>
					</Stack>
				)}
			</Box>

			{!webrtcState.isConnecting && (
				<Group justify="end">
					{webrtcState.isConnected ? (
						<Button
							color="dark"
							onClick={() => {
								context.closeModal(id);
							}}
						>
							Close
						</Button>
					) : (
						<Button
							onClick={() => {
								void getWebRTCClient().connect();
							}}
						>
							Upgrade connection
						</Button>
					)}
				</Group>
			)}
		</React.Fragment>
	);
}
