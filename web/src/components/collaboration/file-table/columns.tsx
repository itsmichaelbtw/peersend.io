import type { PeerSendFile } from "@/state/types";

import { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon, FileIcon, CircleAlertIcon } from "lucide-react";

import { formatFileSize, truncateFileName } from "@/lib/file-transfer";
import { SortableHeader } from "./sorting-header";
import { useTimeDistance } from "@/hooks/use-time-ago";

const columnHelper = createColumnHelper<PeerSendFile>();

export const selectionColumn = columnHelper.display({
	id: "file-select",
	header({ table }) {
		return (
			<Checkbox
				checked={table.getIsAllRowsSelected()}
				onCheckedChange={() => table.toggleAllRowsSelected()}
				className="cursor-pointer"
			/>
		);
	},
	cell({ row }) {
		return (
			<Checkbox
				checked={row.getIsSelected()}
				disabled={!row.getCanSelect()}
				onCheckedChange={() => row.toggleSelected()}
				className="cursor-pointer"
			/>
		);
	},
	size: 54
});

export const fileIconColumn = columnHelper.display({
	id: "file-icon",
	size: 48,
	cell({ row }) {
		const isError = row.original.status === "error";
		return (
			<div
				className={
					isError
						? "flex items-center justify-center h-8 w-8 bg-red-100 text-red-500"
						: "flex items-center justify-center h-8 w-8 bg-secondary text-muted-foreground"
				}
			>
				<FileIcon size={18} />
			</div>
		);
	}
});

export const fileNameColumn = columnHelper.accessor((row) => row.metadata, {
	id: "file-name",
	header({ column }) {
		return <SortableHeader title="File Name" column={column} />;
	},
	cell({ getValue }) {
		const metadata = getValue<PeerSendFile["metadata"]>();
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const fileName = useMemo(() => truncateFileName(metadata.name), [metadata.name]);
		return <span>{fileName}</span>;
	},
	size: undefined,
	enableSorting: true,
	sortDescFirst: true
});

export const fileSizeColumn = columnHelper.accessor((row) => row.metadata, {
	id: "file-size",
	header({ column }) {
		return (
			<div className="flex justify-start">
				<SortableHeader title="Size" column={column} />
			</div>
		);
	},
	cell({ getValue }) {
		const metadata = getValue<PeerSendFile["metadata"]>();
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const fileSize = useMemo(() => formatFileSize(metadata.size), [metadata.size]);
		return <div className="text-left">{fileSize}</div>;
	},
	size: 96,
	maxSize: 96,
	enableSorting: true,
	sortingFn(a, b) {
		return a.original.metadata.size - b.original.metadata.size;
	}
});

export const fileStatusColumn = columnHelper.accessor((file) => file, {
	id: "file-status",
	header({ column }) {
		return (
			<div className="flex justify-center-safe">
				<SortableHeader title="Status" column={column} />
			</div>
		);
	},
	cell({ getValue }) {
		const file = getValue<PeerSendFile>();
		return (
			<div className="flex justify-center-safe w-full">
				{file.status === "in-transit" ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Progress value={file.transfer.percentage} className="h-1.5 w-22.5" />
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>{file.transfer.percentage}%</p>
						</TooltipContent>
					</Tooltip>
				) : file.status === "error" ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<CircleAlertIcon size={16} className="text-destructive cursor-default" />
						</TooltipTrigger>
						<TooltipContent>
							<p>{file.errorMessage ?? "Transfer failed"}</p>
						</TooltipContent>
					</Tooltip>
				) : (
					<Badge variant={file.status === "pending" ? "secondary" : "outline"}>{file.status}</Badge>
				)}
			</div>
		);
	},
	size: 120,
	maxSize: 120,
	enableSorting: true
});

export const fileTimestampColumn = columnHelper.accessor("timestamp", {
	id: "file-timestamp",
	header: "",
	cell({ getValue }) {
		const timestamp = getValue<number>();
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const timeDistance = useTimeDistance(timestamp);
		return <div className="text-right">{timeDistance}</div>;
	},
	size: 124,
	maxSize: 124
});

export const fileActionsColumn = columnHelper.display({
	id: "file-actions",
	size: 52,
	maxSize: 52,
	cell() {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="flex justify-end">
						<Button variant="ghost" size="icon" className="h-7 w-7">
							<EllipsisIcon size={16} />
						</Button>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Hello</DropdownMenuLabel>
					<DropdownMenuItem>Action</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}
});
