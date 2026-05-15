import React from "react";

import { ArrowUpFromLineIcon, LockIcon, RouterIcon, ShieldIcon } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { isAppFeatureEnabled } from "@/state";
import { Button } from "@/components/ui/button";
import { getWebRTCClient } from "@/lib/networking/client-registry";

interface Props {
	onClose: () => void;
}

export function ConnectionUpgrade({ onClose }: Props): React.ReactNode {
	const { webrtcState } = useAppState();

	return (
		<React.Fragment>
			{!webrtcState.isConnected && (
				<div>
					<span className="leading-snug text-muted-foreground">
						To transfer files securely between peers, we need to upgrade your connection
					</span>
				</div>
			)}

			<div className="my-6">
				{webrtcState.isConnected ? (
					<div className="flex flex-col gap-2">
						<div className="flex w-fit mx-auto items-center justify-center bg-green-100 p-4">
							<RouterIcon size={36} className="text-green-600" />
						</div>
						<div className="text-center space-y-1">
							<h3 className="text-lg font-medium">Connection Upgraded Successfully!</h3>
							<p className="text-muted-foreground text-sm">
								You&apos;re now connected via WebRTC and can transfer files up to 500MB in size.
							</p>
						</div>
					</div>
				) : webrtcState.isConnecting ? (
					<div className="flex flex-col gap-2 items-center">
						<h3 className="text-lg font-medium">Establishing WebRTC Connection</h3>
						<div className="animate-spin rounded-full h-5 w-5 border-2 border-border border-t-foreground" />
						<p className="text-xs text-muted-foreground">Do not close this dialog</p>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<div className="p-4 border-2 border-blue-200 bg-blue-50">
							<div className="flex gap-4 items-center flex-nowrap">
								<ArrowUpFromLineIcon size={30} className="text-blue-500 shrink-0" />
								<div>
									<h3 className="font-medium text-blue-800">Connection Upgrade Process</h3>
									<p className="text-sm text-blue-700">
										This is a one-time process that takes just a few seconds to complete
									</p>
								</div>
							</div>
						</div>

						{isAppFeatureEnabled("encryption_mode") && (
							<div className="p-4 border-2 border-border bg-secondary">
								<div className="flex gap-4 items-center flex-nowrap">
									<ShieldIcon size={30} className="shrink-0" />
									<div>
										<h3 className="font-medium">Enhanced Security</h3>
										<p className="text-sm text-muted-foreground">
											WebRTC provides end-to-end encryption for your file transfers
										</p>
									</div>
								</div>
							</div>
						)}

						<div className="p-4 border-2 border-border bg-secondary">
							<div className="flex gap-4 items-center flex-nowrap">
								<LockIcon size={30} className="text-primary shrink-0" />
								<div>
									<h3 className="font-medium">Direct Peer-to-Peer</h3>
									<p className="text-sm text-muted-foreground">
										Files are transferred directly between devices, not through our servers
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{!webrtcState.isConnecting && (
				<div className="flex justify-end">
					{webrtcState.isConnected ? (
						<Button variant="secondary" onClick={onClose}>
							Close
						</Button>
					) : (
						<Button
							onClick={() => {
								const rtc = getWebRTCClient();
								void rtc.connect();
							}}
						>
							Upgrade connection
						</Button>
					)}
				</div>
			)}
		</React.Fragment>
	);
}
