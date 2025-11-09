import type { Column } from "@tanstack/react-table";

import React from "react";

import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface Props<TData, TValue> {
	title: string;
	column: Column<TData, TValue>;
}

export function SortableHeader<TData, TValue>({
	title,
	column
}: Props<TData, TValue>): React.ReactNode {
	const sorted = column.getIsSorted();

	return (
		<button
			type="button"
			className="flex items-center gap-2 select-none cursor-pointer outline-none px-3 py-2 -mx-3 rounded-sm hover:bg-gray-100 data-[is-sorted=true]:bg-gray-100"
			onClick={column.getToggleSortingHandler()}
			data-is-sorted={!!sorted}
		>
			<span className="leading-none">{title}</span>
			{sorted === "asc" && <ArrowUpIcon size={16} />}
			{sorted === "desc" && <ArrowDownIcon size={16} />}
			{!sorted && <ArrowUpDownIcon size={16} />}
		</button>
	);
}
