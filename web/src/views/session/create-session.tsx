import React, { useEffect } from "react";
import { ArrowRightIcon, ChevronLeftIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { WEBSITE_FEATURES } from "@/config/constants";
import { useAppState } from "@/hooks/use-app-state";
import { appState } from "@/state";
import { getWebSocketClient } from "@/lib/networking/client-registry";

const FEATURE_HIGHLIGHTS = [...WEBSITE_FEATURES].sort(() => Math.random() - 0.5).slice(0, 3);

export function CreateSessionView(): React.ReactNode {
	const { sessionState, websocketState } = useAppState();

	const navigate = useNavigate();

	useEffect(() => {
		return (): void => {
			appState.dispatch("RESET_CONNECTING_STATES", null);
		};
	}, []);

	return (
		<Card className="select-none w-md">
			<CardHeader className="border-b">
				<div className="flex items-center justify-between">
					<div className="border-r">
						<Link to="/">
							<Button
								className="h-16 w-16"
								variant="secondary"
								size="icon"
								disabled={websocketState.isConnecting}
							>
								<ChevronLeftIcon size={22} />
							</Button>
						</Link>
					</div>
					<h2 className="font-semibold text-base md:text-lg pr-3 sm:pr-4 md:pr-6">Create a session</h2>
				</div>
			</CardHeader>

			<CardContent className="border-b py-0 px-0">
				{sessionState.isConnected ? (
					<React.Fragment>
						<div className="p-3 sm:p-4 md:p-6">
							<h2 className="font-semibold text-base md:text-lg leading-snug">Session created</h2>
							<p className="text-muted-foreground leading-snug text-sm">
								Share this code with another user to join this session
							</p>
						</div>

						<div className="h-8 w-full relative border-t">
							<div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
						</div>

						{sessionState.sessionCode !== null && (
							<React.Fragment>
								<div className="px-3 sm:px-4 md:px-6 py-3 border-y bg-secondary">
									<div className="flex items-center justify-between">
										<p className="font-mono text-sm select-text">{sessionState.sessionCode}</p>
										<CopyButton value={sessionState.sessionCode} />
									</div>
								</div>
								<div className="ml-auto w-fit leading-none py-3 px-3 sm:px-4 md:px-6">
									<span className="text-sm text-muted-foreground">
										{sessionState.clients.length}/{sessionState.maximumClients} connected
									</span>
								</div>
							</React.Fragment>
						)}

						<div className="p-3 sm:p-4 md:p-6 border-y bg-secondary">
							<h3 className="text-base mb-2">Session details</h3>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Maximum connections:</span>
									<span className="font-semibold">{sessionState.maximumClients}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Auto WebRTC:</span>
									{sessionState.autoWebRTC ? (
										<span className="text-primary font-semibold">Enabled</span>
									) : (
										<span className="text-destructive font-semibold">Disabled</span>
									)}
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">End-to-end encryption:</span>
									{sessionState.encryptionMode !== "none" ? (
										<span className="text-primary font-semibold">
											{sessionState.encryptionMode}
										</span>
									) : (
										<span className="text-destructive font-semibold">Disabled</span>
									)}
								</div>
							</div>
						</div>

						<Button
							disabled={websocketState.isConnecting}
							size="sm"
							className="w-full"
							onClick={() => {
								void navigate(`/session/${sessionState.sessionCode}`);
							}}
						>
							{websocketState.isConnecting && (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
							)}
							Enter <ArrowRightIcon size={18} />
						</Button>
					</React.Fragment>
				) : (
					<React.Fragment>
						<div className="p-3 sm:p-4 md:p-6">
							<h2 className="font-semibold text-base md:text-lg leading-snug">Start a new session</h2>
							<p className="text-muted-foreground leading-snug text-sm">
								Create a secure session to share files with another person or device
							</p>
						</div>

						<div className="h-8 w-full relative border-t">
							<div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
						</div>

						<div className="grid grid-cols-2 divide-x divide-border border-t">
							{FEATURE_HIGHLIGHTS.slice(0, 2).map(({ Icon, title, subDescription }) => (
								<div key={title} className="flex flex-col items-center py-6 text-center">
									<Icon size={22} className="text-primary mb-2" />
									<h3 className="text-sm font-medium">{title}</h3>
									<p className="text-xs text-muted-foreground">{subDescription}</p>
								</div>
							))}
						</div>
						{FEATURE_HIGHLIGHTS[2] &&
							((): React.ReactNode => {
								const { Icon: ThirdIcon, title, subDescription } = FEATURE_HIGHLIGHTS[2];
								return (
									<div className="flex flex-col items-center border-t border-border py-6 text-center">
										<ThirdIcon size={22} className="text-primary mb-2" />
										<h3 className="text-sm font-medium">{title}</h3>
										<p className="text-xs text-muted-foreground">{subDescription}</p>
									</div>
								);
							})()}

						<Button
							disabled={websocketState.isConnecting}
							size="sm"
							className="w-full"
							onClick={() => {
								const ws = getWebSocketClient();
								void ws.connect();
							}}
						>
							{websocketState.isConnecting && (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
							)}
							Create session
						</Button>
					</React.Fragment>
				)}
			</CardContent>

			<div className="h-8 w-full relative border-b">
				<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
			</div>

			<div className="pl-3 sm:pl-4 md:pl-6 h-14">
				<div className="w-full h-full flex items-stretch justify-between gap-6">
					{websocketState.isConnecting ? (
						<p className="text-sm text-muted-foreground flex items-center">Connecting...</p>
					) : !sessionState.isConnected ? (
						<React.Fragment>
							<div className="flex items-center">
								<p className="text-sm text-muted-foreground">Already have a session code?</p>
							</div>
							<div className="flex items-center border-l px-3 sm:px-4 md:px-6 bg-secondary">
								<Link to="/session/join">
									<Button variant="link" size="sm" className="px-0 py-0 text-sm h-auto">
										Join session
									</Button>
								</Link>
							</div>
						</React.Fragment>
					) : (
						<p className="text-sm text-muted-foreground flex items-center">
							This room will expire in 30 minutes if unused
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}
