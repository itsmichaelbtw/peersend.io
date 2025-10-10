import { columnHelper } from "../helper";
import { useTimeDistance } from "@/hooks/use-time-ago";

export const fileTimestampColumn = columnHelper.accessor("timestamp", {
	id: "file-timestamp",
	header: "",
	cell({ getValue }) {
		const timestamp = getValue<number>();
		const timeDistance = useTimeDistance(timestamp);

		return <div className="text-right">{timeDistance}</div>;
	},
	size: 124,
	maxSize: 124
});
