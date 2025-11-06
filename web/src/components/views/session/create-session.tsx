import React, { useEffect, useState } from "react";

import {
	CopyIcon,
	CopyCheckIcon,
	ArrowRightIcon,
	ShieldIcon,
	GlobeIcon,
	ClockIcon,
	ChevronLeftIcon
} from "lucide-react";

import { Card, Button, Tooltip, CopyButton, ActionIcon, Group, Box, Stack } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";

import { useNavigate } from "react-router";
import { useAppState } from "@/hooks/use-app-state";

import { appState } from "@/state";
import { getWebSocketClient } from "@/lib/networking/utils";

const VARIANTS = {
	fadeIn: { opacity: 1, y: 0 },
	enter: (direction: number) => ({ y: direction > 0 ? 50 : -50, opacity: 0 }),
	center: { y: 0, opacity: 1, transition: { duration: 0.1 } },
	exit: (direction: number) => ({
		y: direction < 0 ? 50 : -50,
		opacity: 0,
		transition: { duration: 0.1 }
	})
};

export function CreateSessionView() {
	const { sessionState, websocketState } = useAppState();

	const navigate = useNavigate();
	const [isFirstRender, setIsFirstRender] = useState(true);

	useEffect(() => {
		return () => {
			appState.dispatch("RESET_CONNECTING_STATES", null);
		};
	}, []);

	return (
		<Card shadow="sm" padding="lg" radius="sm" className="select-none w-md" withBorder>
			<Card.Section withBorder inheritPadding py="md">
				<Group gap="sm">
					<ActionIcon variant="light" size="md" disabled={websocketState.isConnecting}>
						<ChevronLeftIcon size={22} />
					</ActionIcon>
					<h1 className="font-semibold text-lg">Create a session</h1>
				</Group>
			</Card.Section>

			<Card.Section withBorder inheritPadding py="xl">
				<AnimatePresence mode="wait" custom={sessionState.isConnected ? 1 : -1}>
					{sessionState.isConnected ? (
						<motion.div
							key="connected"
							variants={VARIANTS}
							custom={1}
							initial={isFirstRender ? { opacity: 0 } : "enter"}
							animate={isFirstRender ? "fadeIn" : "center"}
							exit="exit"
							onAnimationComplete={() => {
								if (isFirstRender) {
									setIsFirstRender(false);
								}
							}}
						>
							<h2 className="font-semibold text-lg leading-snug">Session created</h2>
							<p className="text-black/50 leading-snug">
								Share this code with another user to join this session
							</p>

							{sessionState.sessionCode !== null && (
								<React.Fragment>
									<Box p="md" mt="xs" mb="xs" className="rounded border border-gray-200 bg-gray-50">
										<Group justify="space-between">
											<p className="font-mono text-sm select-text">{sessionState.sessionCode}</p>
											<CopyButton value={sessionState.sessionCode}>
												{({ copy, copied }) => (
													<Tooltip label={copied ? "Copied!" : "Copy session code"}>
														<ActionIcon
															onClick={copy}
															variant="light"
															color={copied ? "teal" : "gray"}
														>
															{copied ? <CopyCheckIcon size={20} /> : <CopyIcon size={20} />}
														</ActionIcon>
													</Tooltip>
												)}
											</CopyButton>
										</Group>
									</Box>
									<div className="ml-auto w-fit leading-none">
										<span className="text-sm text-gray-500">
											{sessionState.clients.length}/{sessionState.maximumClients} connected
										</span>
									</div>
								</React.Fragment>
							)}

							<Box p="md" mt="xs" mb="sm" className="rounded border border-gray-200 bg-gray-50">
								<h3 className="text-base mb-2">Session details</h3>
								<div className="space-y-1 text-sm">
									<Group justify="space-between">
										<span className="text-gray-500">Maximum connections:</span>
										<span className="font-semibold">{sessionState.maximumClients}</span>
									</Group>
									<Group justify="space-between">
										<span className="text-gray-500">Auto WebRTC:</span>
										{sessionState.autoWebRTC ? (
											<span className="text-(--mantine-color-teal-7) font-semibold">Enabled</span>
										) : (
											<span className="text-(--mantine-color-red-7) font-semibold">Disabled</span>
										)}
									</Group>
									<Group justify="space-between">
										<span className="text-gray-500">End-to-end encryption:</span>
										{sessionState.encryptionMode !== "none" ? (
											<span className="text-(--mantine-color-teal-7) font-semibold">
												{sessionState.encryptionMode}
											</span>
										) : (
											<span className="text-(--mantine-color-red-7) font-semibold">Disabled</span>
										)}
									</Group>
								</div>
							</Box>

							<Button
								loading={websocketState.isConnecting}
								size="sm"
								fullWidth
								onClick={() => {
									void navigate(`/session/${sessionState.sessionCode}`);
								}}
							>
								Enter <ArrowRightIcon size={18} />
							</Button>
						</motion.div>
					) : (
						<motion.div
							key="not-connected"
							variants={VARIANTS}
							custom={-1}
							initial={isFirstRender ? { opacity: 0 } : "enter"}
							animate={isFirstRender ? "fadeIn" : "center"}
							exit="exit"
							onAnimationComplete={() => {
								if (isFirstRender) {
									setIsFirstRender(false);
								}
							}}
						>
							<h2 className="font-semibold text-lg leading-tight">Start a new session</h2>
							<p className="text-black/50 leading-tight">
								Create a secure session to share files with another person
							</p>

							<Stack mt="xs" mb="sm">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<Stack
										gap={0}
										align="center"
										className="rounded-lg border border-gray-200 p-3 text-center"
									>
										<ShieldIcon size={30} className="mb-2" />
										<h3 className="text-sm font-medium">End-to-end Encrypted</h3>
										<p className="text-xs text-gray-500">Your files stay private</p>
									</Stack>
									<Stack
										gap={0}
										align="center"
										className="rounded-lg border border-gray-200 p-3 text-center"
									>
										<GlobeIcon size={30} className="mb-2" />
										<h3 className="text-sm font-medium">Direct Connection</h3>
										<p className="text-xs text-gray-500">No server storage</p>
									</Stack>
								</div>
								<Stack
									gap={0}
									align="center"
									className="rounded-lg border border-gray-200 p-3 text-center"
								>
									<ClockIcon size={30} className="mb-2" />
									<h3 className="text-sm font-medium">Temporary Sessions</h3>
									<p className="text-xs text-gray-500">
										Sessions expire after 30 minutes of inactivity
									</p>
								</Stack>
							</Stack>

							<Button
								loading={websocketState.isConnecting}
								size="sm"
								fullWidth
								onClick={() => {
									void getWebSocketClient().connect();
								}}
							>
								Create session
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</Card.Section>

			<Card.Section withBorder inheritPadding py="xs" className="h-14">
				<motion.div
					key={
						websocketState.isConnecting
							? "connecting"
							: sessionState.isConnected
								? "connected"
								: "idle"
					}
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -5 }}
					transition={{ duration: 0.1 }}
				>
					<Group gap="xs">
						{websocketState.isConnecting ? (
							<p className="text-sm text-gray-500 leading-none mt-2.5">Connecting...</p>
						) : !sessionState.isConnected ? (
							<React.Fragment>
								<p className="leading-tight text-sm text-gray-500">Already have a session code?</p>
								<Button
									variant="transparent"
									px={0}
									py={0}
									classNames={{
										label: "text-sm hover:underline"
									}}
									onClick={() => void navigate("/session/join")}
								>
									Join session
								</Button>
							</React.Fragment>
						) : (
							<p className="my-3 text-sm text-gray-500 leading-none">
								This room will expire in 30 minutes if unused
							</p>
						)}
					</Group>
				</motion.div>
			</Card.Section>
		</Card>
	);
}
