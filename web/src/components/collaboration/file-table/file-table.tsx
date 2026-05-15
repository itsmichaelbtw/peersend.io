import type { WithChildren } from "@/types/misc";
import type { PeerSendFile } from "@/state/types";
import type { PaginationState, RowSelectionState } from "@tanstack/react-table";

import React, { useState, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	useReactTable,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
	fileIconColumn,
	fileNameColumn,
	fileSizeColumn,
	fileTimestampColumn,
	fileStatusColumn,
	selectionColumn
} from "./columns";

const PAGE_SIZE = 5;

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
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE
	});

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
			rowSelection: rowSelection,
			pagination: pagination
		},
		columnResizeMode: "onChange",
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		getRowId(originalRow) {
			return originalRow.id;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		enableRowSelection: (row) => row.original.status !== "in-transit",
		enableMultiSort: false
	});

	const selectedFiles = table.getSelectedRowModel().rows.map((r) => r.original);
	const pageCount = table.getPageCount();
	const showPagination = files.length > PAGE_SIZE;

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

			{showPagination && (
				<div className="flex items-center justify-between px-4 py-2 border-t text-sm text-muted-foreground">
					<span>
						Page {pagination.pageIndex + 1} of {pageCount}
					</span>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeftIcon size={16} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ChevronRightIcon size={16} />
						</Button>
					</div>
				</div>
			)}

			{files.length > 0 &&
				children({
					isUsingSelection: selectedFiles.length > 0,
					files: selectedFiles.length > 0 ? selectedFiles : []
				})}
		</React.Fragment>
	);
}
