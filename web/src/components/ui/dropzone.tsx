import React from "react";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";
import { UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type { FileWithPath };

type DropzoneProps = {
	onDrop: (files: FileWithPath[]) => void;
	onReject?: (files: { file: FileWithPath; errors: { code: string; message: string }[] }[]) => void;
	maxSize?: number;
	accept?: Record<string, string[]>;
	disabled?: boolean;
	className?: string;
};

export function Dropzone({
	onDrop,
	onReject,
	maxSize,
	accept,
	disabled,
	className
}: DropzoneProps): React.ReactNode {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: (accepted: FileWithPath[]) => onDrop(accepted),
		onDropRejected: onReject
			? (rejected): void =>
					onReject(
						rejected.map((r) => ({
							file: r.file,
							errors: r.errors.map((e) => ({ code: e.code, message: e.message }))
						}))
					)
			: undefined,
		maxSize,
		accept,
		disabled
	});

	return (
		<div
			{...getRootProps()}
			className={cn(
				"flex flex-col items-center justify-center gap-3 p-12 cursor-pointer transition-colors bg-secondary text-muted-foreground",
				isDragActive
					? "border-primary bg-primary/5"
					: "hover:border-primary/50 hover:bg-primary/10 hover:text-primary/80",
				disabled && "opacity-50 cursor-not-allowed",
				className
			)}
		>
			<input {...getInputProps()} />
			<UploadIcon size={28} />
			<p className="text-sm text-center">
				{isDragActive ? "Drop files here" : "Drag files here or click to select"}
			</p>
		</div>
	);
}
