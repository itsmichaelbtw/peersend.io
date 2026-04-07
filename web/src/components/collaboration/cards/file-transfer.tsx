import type { PeerSendFile } from "@/state/types";

import React from "react";

import { DownloadIcon, SendIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import type { FileWithPath } from "@/components/ui/dropzone";
import { toast } from "sonner";
import { useFileTransferState } from "@/hooks/use-file-transfer-state";
import {
	FileTransfer,
	WebRTCTransport,
	createCustomFileFromUpload,
	downloadFiles
} from "@/lib/file-transfer";
import { getWebRTCClient } from "@/lib/networking/client-registry";
import { appState, fileTransferState } from "@/state";

import { FileTable } from "../file-table";

export function FileTransferCard(): React.ReactNode {
	const { fileGroups } = useFileTransferState();

	async function onSend(files: PeerSendFile[]): Promise<void> {
		const filesToSend = files.filter((f) => f.status === "pending");

		if (filesToSend.length === 0) {
			return;
		}

		const { webrtcState } = appState.get();

		fileTransferState.dispatch(
			"BULK_UPDATE_FILES",
			filesToSend.map((file) => ({
				...file,
				status: "in-transit"
			}))
		);

		const rtc = getWebRTCClient();
		const transport = new WebRTCTransport(rtc, webrtcState.dataChannel!.getDataChannel());

		const fileTransfer = new FileTransfer(filesToSend, transport);
		await fileTransfer.send();
	}

	function onDownload(files: PeerSendFile[]): void {
		downloadFiles(files);
	}

	function onDrop(files: FileWithPath[]): void {
		const customFiles: PeerSendFile[] = [];

		for (const file of files) {
			const customFile = createCustomFileFromUpload(file);
			customFiles.push(customFile);
		}

		fileTransferState.add(customFiles);
	}

	function onReject(
		rejections: { file: FileWithPath; errors: { code: string; message: string }[] }[]
	): void {
		for (const rejection of rejections) {
			toast.error(`File Upload Error: ${rejection.file.name}`, {
				description: rejection.errors.map((e) => e.message).join(", ")
			});
		}
	}

	return (
		<div className="divide-y">
			<div className="p-3 sm:p-4 md:p-6 flex items-center justify-between">
				<h2 className="font-semibold text-base md:text-lg leading-snug">File Transfer</h2>
				<Badge variant="secondary">500MB limit</Badge>
			</div>

			<Dropzone onDrop={onDrop} onReject={onReject} />
			<FileTable files={fileGroups.outgoing}>
				{({ isUsingSelection, files }) => {
					const filesToRemove = isUsingSelection ? files : fileGroups.outgoing;
					const hasInTransit = filesToRemove.some((f) => f.status === "in-transit");
					return (
						<div className="flex items-center justify-between pl-4">
							<div>
								{isUsingSelection && (
									<p className="text-sm text-muted-foreground">
										{files.length} of {fileGroups.outgoing.length} selected
									</p>
								)}
							</div>
							<div className="flex items-center">
								<Button
									size="sm"
									variant="secondary"
									disabled={hasInTransit}
									className="gap-1.5"
									onClick={() => {
										fileTransferState.remove(filesToRemove);
									}}
								>
									<Trash2Icon size={16} />
									{isUsingSelection ? `Remove (${files.length})` : "Clear"}
								</Button>
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => {
										void onSend(isUsingSelection ? files : fileGroups.outgoing);
									}}
								>
									<SendIcon size={16} />
									Send {isUsingSelection && `(${files.length})`}
								</Button>
							</div>
						</div>
					);
				}}
			</FileTable>

			<div className="p-3 sm:p-4 md:p-6">
				<h2 className="font-semibold text-base md:text-lg leading-snug">Shared Files</h2>
			</div>

			<FileTable
				files={fileGroups.incoming}
				emptyComponent={
					<div className="flex justify-center p-12">
						<p className="text-sm text-muted-foreground">Files sent by others will appear here</p>
					</div>
				}
			>
				{({ isUsingSelection, files }) => {
					const filesToRemove = isUsingSelection ? files : fileGroups.incoming;
					const hasInTransit = filesToRemove.some((f) => f.status === "in-transit");
					return (
						<div className="flex items-center justify-between pl-4">
							<div>
								{isUsingSelection && (
									<p className="text-sm text-muted-foreground">
										{files.length} of {fileGroups.incoming.length} selected
									</p>
								)}
							</div>
							<div className="flex items-center">
								<Button
									size="sm"
									variant="secondary"
									disabled={hasInTransit}
									className="gap-1.5"
									onClick={() => {
										fileTransferState.remove(filesToRemove);
									}}
								>
									<Trash2Icon size={16} />
									{isUsingSelection ? `Remove (${files.length})` : "Clear"}
								</Button>
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => {
										onDownload(isUsingSelection ? files : fileGroups.incoming);
									}}
								>
									<DownloadIcon size={16} />
									Download {isUsingSelection && `(${files.length})`}
								</Button>
							</div>
						</div>
					);
				}}
			</FileTable>
		</div>
	);
}
