import React from "react";

import { columnHelper } from "../helper";
import { useTimeDistance } from "@/hooks/use-time-ago";

function Cell(timestamp: number): React.ReactNode {
	const timeDistance = useTimeDistance(timestamp);

	return <div className="text-right">{timeDistance}</div>;
}

export const fileTimestampColumn = columnHelper.accessor("timestamp", {
	id: "file-timestamp",
	header: "",
	cell({ getValue }) {
		const timestamp = getValue<number>();
		return Cell(timestamp);
	},
	size: 124,
	maxSize: 124
});
