import React, { useEffect, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/hooks/use-app-state";
import { appState } from "@/state";
import { envVar } from "@/config/constants";
import { getWebSocketClient } from "@/lib/networking/client-registry";
import { Seo } from "@/components/seo";

const INFO_LIST_POINTS: string[] = [
	"You'll initially connect to our servers",
	"When both users are connected, you can upgrade to a direct connection",
	"File sharing is only available with a direct connection"
];

const REGEX = /^X-[A-Z0-9]{6}$/;

export function JoinSessionView(): React.ReactNode {
	const { websocketState, sessionState } = useAppState();

	const navigate = useNavigate();

	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (sessionState.isConnected) {
			void navigate(`/session/${sessionState.sessionCode}`);
		}
	}, [sessionState.isConnected, sessionState.sessionCode, navigate]);

	useEffect(() => {
		return (): void => {
			appState.dispatch("RESET_CONNECTING_STATES", null);
		};
	}, []);

	async function onEnter(): Promise<void> {
		if (!code) {
			setError("A session code is required");
			return;
		}
		if (!REGEX.test(code)) {
			setError(`Please enter a valid session code (e.g. ${envVar.SESSION_CODE_EXAMPLE})`);
			return;
		}
		setError(null);
		const ws = getWebSocketClient();
		await ws.connect(code);
	}

	return (
		<Card className="select-none w-md">
			<Seo
				title="Join a session"
				description="Enter a session code to receive files directly from a peer — secure, encrypted, zero storage."
				noIndex
			/>
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
					<h2 className="font-semibold text-base md:text-lg pr-3 sm:pr-4 md:pr-6">Join a session</h2>
				</div>
			</CardHeader>

			<CardContent className="border-b py-0 px-0">
				<div className="p-3 sm:p-4 md:p-6">
					<h2 className="font-semibold text-base md:text-lg leading-snug">Enter session code</h2>
					<p className="text-muted-foreground leading-snug text-sm">
						Ask the session host for their unique code
					</p>
				</div>

				<div className="h-8 w-full relative border-t">
					<div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
				</div>

				<div className="border-t flex items-stretch">
					<div className="w-1/2 p-3 sm:p-4 md:p-6 flex justify-center border-r border-b">
						<Label htmlFor="session-code">Session code</Label>
					</div>
					<div className="w-1/2 bg-primary">
						<Input
							id="session-code"
							value={code}
							onChange={(e) => {
								setCode(e.target.value.toUpperCase());
								if (error) setError(null);
							}}
							placeholder={`e.g. ${envVar.SESSION_CODE_EXAMPLE}`}
							className="border-x-0 px-3 sm:px-4 md:px-6 h-full bg-transparent border-0 placeholder:text-white/50 text-white"
						/>
					</div>
				</div>
				{error && (
					<p className="text-xs text-destructive pr-3 sm:pr-4 md:pr-6 py-3 text-right ml-auto w-fit">{error}</p>
				)}

				<div className="p-3 sm:p-4 md:p-6 bg-secondary">
					<h4 className="text-base">What to expect</h4>
					<ul className="space-y-2 text-sm text-muted-foreground mt-2.5">
						{INFO_LIST_POINTS.map((item, index) => (
							<li key={index} className="flex items-start gap-2">
								<span className="bg-primary/15 mt-0.5 p-1">
									<span className="bg-primary/75 block h-1.5 w-1.5" />
								</span>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>

				<Button
					disabled={websocketState.isConnecting}
					size="sm"
					className="w-full"
					onClick={() => void onEnter()}
				>
					{websocketState.isConnecting && (
						<div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
					)}
					Enter <ArrowRightIcon size={18} />
				</Button>
			</CardContent>

			<div className="h-8 w-full relative border-b">
				<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
			</div>

			<div className="pl-3 sm:pl-4 md:pl-6 h-14 flex">
				<div className="w-full h-full flex items-stretch justify-between gap-6">
					{websocketState.isConnecting ? (
						<p className="text-sm text-muted-foreground flex items-center">Joining...</p>
					) : !sessionState.isConnected ? (
						<React.Fragment>
							<div className="flex items-center">
								<p className="text-sm text-muted-foreground">Don&apos;t have a session code?</p>
							</div>
							<div className="flex items-center border-l px-3 sm:px-4 md:px-6 bg-secondary">
								<Link to="/session/create">
									<Button variant="link" size="sm" className="px-0 py-0 text-sm h-auto">
										Create a session
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
