import type { PeerSendFile } from "@/state/types";

import { useMemo } from "react";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";
import { truncateFileName } from "@/lib/file-transfer";

function Cell(name: string) {
	const fileName = useMemo(() => {
		return truncateFileName(name);
	}, [name]);

	return <span>{fileName}</span>;
}

export const fileNameColumn = columnHelper.accessor((row) => row.metadata, {
	id: "file-name",
	header({ column }) {
		return <SortableHeader title="File Name" column={column} />;
	},
	cell({ getValue }) {
		const metadata = getValue<PeerSendFile["metadata"]>();
		return Cell(metadata.name);
	},
	size: undefined,
	enableSorting: true,
	sortDescFirst: true
});
