import type { PeerSendFile } from "@/state/types";

import { useMemo } from "react";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";
import { formatFileSize } from "@/lib/file-transfer";

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
		const fileSize = useMemo(() => {
			return formatFileSize(metadata.size);
		}, []);

		return <div className="text-left">{fileSize}</div>;
	},
	size: 96,
	maxSize: 96,
	enableSorting: true,
	sortingFn(a, b) {
		const sizeA = a.original.metadata.size;
		const sizeB = b.original.metadata.size;

		return sizeA - sizeB;
	}
});
