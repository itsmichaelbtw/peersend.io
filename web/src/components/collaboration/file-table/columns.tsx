import type { PeerSendFile } from "@/state/types";

import { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { ActionIcon, Badge, Checkbox, Menu, Progress, ThemeIcon, Tooltip } from "@mantine/core";
import { EllipsisIcon, FileIcon } from "lucide-react";

import { formatFileSize, truncateFileName } from "@/lib/file-transfer";
import { SortableHeader } from "./sorting-header";
import { useTimeDistance } from "@/hooks/use-time-ago";

const columnHelper = createColumnHelper<PeerSendFile>();

export const selectionColumn = columnHelper.display({
	id: "file-select",
	header({ table }) {
		return (
			<Checkbox
				size="xs"
				styles={{ input: { cursor: "pointer" } }}
				checked={table.getIsAllRowsSelected()}
				onChange={table.getToggleAllRowsSelectedHandler()}
			/>
		);
	},
	cell({ row }) {
		return (
			<Checkbox
				size="xs"
				styles={{ input: { cursor: "pointer" } }}
				checked={row.getIsSelected()}
				disabled={!row.getCanSelect()}
				onChange={row.getToggleSelectedHandler()}
			/>
		);
	},
	size: 54
});

export const fileIconColumn = columnHelper.display({
	id: "file-icon",
	size: 48,
	cell() {
		return (
			<ThemeIcon variant="light" color="gray">
				<FileIcon size={18} className="text-gray-800" />
			</ThemeIcon>
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
					<Tooltip label={`${file.transfer.percentage}%`}>
						<Progress value={file.transfer.percentage} h={6} w={90} animated />
					</Tooltip>
				) : (
					<Badge variant={file.status === "pending" ? "light" : "dot"} color="gray">
						{file.status}
					</Badge>
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
			<Menu>
				<Menu.Target>
					<div className="flex justify-end">
						<ActionIcon variant="subtle" color="gray" size="sm">
							<EllipsisIcon />
						</ActionIcon>
					</div>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>Hello</Menu.Label>
				</Menu.Dropdown>
			</Menu>
		);
	}
});
