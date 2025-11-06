import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { Box } from "@mantine/core";
import { useCompatibility } from "@/hooks/use-compatibility";

export function CompatibilityView() {
	const { browser, isCompatible } = useCompatibility();

	if (isCompatible) {
		return (
			<Box w="100%" mx="auto" className="max-w-lg">
				<Box display="flex" h="100vh" px={32} className="flex-col items-center justify-center">
					<div className="mb-6 h-fit w-fit rounded-full bg-green-100 p-4">
						<CheckIcon size={36} className="text-green-400" />
					</div>

					<h2 className="mb-2 text-xl font-semibold">Browser Compatible</h2>

					<p className="mb-4 text-center leading-tight text-gray-700">
						Your browser {browser !== "unknown" && <span>({browser})</span>} fully supports WebRTC,
						allowing you to establish secure, peer-to-peer connections for real-time communication
						and data transfers.
					</p>
				</Box>
			</Box>
		);
	}

	return (
		<Box w="100%" mx="auto" className="max-w-lg">
			<Box display="flex" h="100vh" px={32} className="flex-col items-center justify-center">
				<div className="mb-6 h-fit w-fit rounded-full bg-red-100 p-4">
					<AlertTriangleIcon size={36} className="text-red-400" />
				</div>

				<h2 className="mb-2 text-xl font-semibold">Incompatible Browser</h2>

				<p className="mb-8 text-center leading-tight">
					Your browser {browser !== "unknown" && <span>({browser})</span>} doesn&apos;t fully
					support WebRTC technology, which is required for PeerSend&apos;s direct peer-to-peer file
					transfers.
				</p>

				<div className="rounded-md bg-red-50 p-4 [&>p]:text-red-800">
					<p className="mb-1 font-medium">Why does this matter?</p>
					<p className="text-sm">
						PeerSend uses WebRTC to create secure, direct connections between devices without
						storing files on our servers. Without WebRTC support, you won&apos;t be able to send or
						receive files.
					</p>
				</div>
			</Box>
		</Box>
	);
}
