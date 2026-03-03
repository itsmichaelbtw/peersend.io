import React, { useEffect } from "react";

import { ArrowRightIcon, ChevronLeftIcon } from "lucide-react";

import { Card, Button, ActionIcon, TextInput, Box, Group } from "@mantine/core";
import { useField } from "@mantine/form";
import { motion } from "framer-motion";

import { useNavigate } from "react-router";
import { useAppState } from "@/hooks/use-app-state";

import { appState } from "@/state";
import { envVar } from "@/config/constants";
import { getWebSocketClient } from "@/lib/networking/client-registry";

const INFO_LIST_POINTS: string[] = [
	"You'll initially connect to our servers",
	"When both users are connected, you can upgrade to a direct connection",
	"File sharing is only available with a direct connection"
];

const REGEX = /^X-[A-Z0-9]{6}$/;

export function JoinSessionView(): React.ReactNode {
	const { websocketState, sessionState } = useAppState();

	const navigate = useNavigate();

	const field = useField({
		initialValue: "",
		validate(value) {
			if (!value) {
				return "A session code is required";
			}

			if (!REGEX.test(value)) {
				return `Please enter a valid session code (e.g. ${envVar.SESSION_CODE_EXAMPLE})`;
			}

			return null;
		}
	});

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
		if (!(await field.validate())) {
			const ws = getWebSocketClient();
			await ws.connect(field.getValue());
		}
	}

	return (
		<Card shadow="sm" padding="lg" radius="sm" className="select-none w-md" withBorder>
			<Card.Section withBorder inheritPadding py="md">
				<Group gap="sm">
					<ActionIcon variant="light" size="md" disabled={websocketState.isConnecting}>
						<ChevronLeftIcon size={22} />
					</ActionIcon>
					<h1 className="font-semibold text-lg">Join a session</h1>
				</Group>
			</Card.Section>

			<Card.Section withBorder inheritPadding py="xl">
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: 0 }}>
					<h2 className="font-semibold text-lg leading-snug">Enter session code</h2>
					<p className="text-black/50 leading-snug">Ask the session host for their unique code</p>

					<TextInput
						{...field.getInputProps()}
						placeholder={`e.g. ${envVar.SESSION_CODE_EXAMPLE}`}
						className="mt-4"
					/>

					<Box p="md" my="md" className="rounded border border-gray-200 bg-gray-50">
						<h4 className="text-base">What to expect</h4>
						<ul className="space-y-2 text-sm text-gray-500 mt-2.5">
							{INFO_LIST_POINTS.map((item, index) => (
								<li key={index} className="flex items-start gap-2">
									<span className="bg-(--mantine-primary-color-filled)/15 mt-0.5 rounded-full p-1">
										<span className="bg-(--mantine-primary-color-filled)/75 block h-1.5 w-1.5 rounded-full" />
									</span>
									<span>{item}</span>
								</li>
							))}
						</ul>
					</Box>

					<Button
						loading={websocketState.isConnecting}
						size="sm"
						fullWidth
						onClick={() => void onEnter()}
					>
						Enter <ArrowRightIcon size={18} />
					</Button>
				</motion.div>
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
							<p className="text-sm text-gray-500 leading-none mt-2.5">Joining...</p>
						) : !sessionState.isConnected ? (
							<React.Fragment>
								<p className="leading-tight text-sm text-gray-500">
									Don&apos;t have a session code?
								</p>
								<Button
									variant="transparent"
									px={0}
									py={0}
									classNames={{
										label: "text-sm hover:underline"
									}}
									onClick={() => {
										void navigate("/session/create");
									}}
								>
									Create session
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
