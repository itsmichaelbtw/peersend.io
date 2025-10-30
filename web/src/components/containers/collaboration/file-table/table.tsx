import type { WithChildren } from "@/types/misc";
import type { PeerSendFile } from "@/state/types";
import type { RowSelectionState } from "@tanstack/react-table";

import React, { useState } from "react";
import { Table } from "@mantine/core";
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

export function FileTable({ files, emptyComponent, children }: Props) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const table = useReactTable({
		data: files,
		columns: [
			selectionColumn,
			fileIconColumn,
			fileNameColumn,
			fileSizeColumn,
			fileStatusColumn,
			fileTimestampColumn
			// fileActionsColumn
		],
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
		enableRowSelection: true,
		enableMultiSort: false
	});

	const selectedFiles = table.getSelectedRowModel().rows.map((r) => r.original);

	if (files.length === 0) {
		return emptyComponent;
	}

	return (
		<React.Fragment>
			<Table layout="fixed" withRowBorders={false} striped>
				<Table.Thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.Tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<Table.Th
									key={header.id}
									style={{
										width: header.column.columnDef.size ? header.getSize() : undefined,
										fontWeight: 600
									}}
								>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</Table.Th>
							))}
						</Table.Tr>
					))}
				</Table.Thead>
				<Table.Tbody>
					{table.getRowModel().rows.map((row) => (
						<Table.Tr
							key={row.id}
							data-selected={row.getIsSelected()}
							onClick={row.getToggleSelectedHandler()}
						>
							{row.getVisibleCells().map((cell) => (
								<Table.Td key={cell.id} id={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</Table.Td>
							))}
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
			{files.length > 0 &&
				children({
					isUsingSelection: selectedFiles.length > 0,
					files: selectedFiles.length > 0 ? selectedFiles : []
				})}
		</React.Fragment>
	);
}
