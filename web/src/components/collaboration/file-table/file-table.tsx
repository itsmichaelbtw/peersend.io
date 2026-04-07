import type { WithChildren } from "@/types/misc";
import type { PeerSendFile } from "@/state/types";
import type { RowSelectionState } from "@tanstack/react-table";

import React, { useState, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import {
	useReactTable,
	flexRender,
	getCoreRowModel,
	getSortedRowModel
} from "@tanstack/react-table";

import {
	fileIconColumn,
	fileNameColumn,
	fileSizeColumn,
	fileTimestampColumn,
	fileStatusColumn,
	selectionColumn
} from "./columns";

interface RenderChildrenArgs {
	isUsingSelection: boolean;
	files: PeerSendFile[];
}

interface Props extends WithChildren<"required", (args: RenderChildrenArgs) => React.ReactNode> {
	emptyComponent?: React.ReactNode;
	files: PeerSendFile[];
}

export function FileTable({ files, emptyComponent, children }: Props): React.ReactNode {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const columns = useMemo(
		() => [
			selectionColumn,
			fileIconColumn,
			fileNameColumn,
			fileSizeColumn,
			fileStatusColumn,
			fileTimestampColumn
		],
		[]
	);

	const table = useReactTable({
		data: files,
		columns: columns,
		state: {
			rowSelection: rowSelection
		},
		columnResizeMode: "onChange",
		onRowSelectionChange: setRowSelection,
		getRowId(originalRow) {
			return originalRow.id;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		enableRowSelection: (row) => row.original.status !== "in-transit",
		enableMultiSort: false
	});

	const selectedFiles = table.getSelectedRowModel().rows.map((r) => r.original);

	if (files.length === 0) {
		return emptyComponent;
	}

	return (
		<React.Fragment>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									style={{
										width: header.column.columnDef.size ? header.getSize() : undefined
									}}
								>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							data-selected={row.getIsSelected()}
							data-state={row.getIsSelected() ? "selected" : undefined}
							onClick={row.getToggleSelectedHandler()}
							className="cursor-pointer"
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
			{files.length > 0 &&
				children({
					isUsingSelection: selectedFiles.length > 0,
					files: selectedFiles.length > 0 ? selectedFiles : []
				})}
		</React.Fragment>
	);
}
