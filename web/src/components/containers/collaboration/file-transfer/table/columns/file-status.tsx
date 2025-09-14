import type { PeerSendFile } from "@/context/file-transfer";

import { Badge } from "@mantine/core";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";

export const fileStatusColumn = columnHelper.accessor("status", {
  id: "file-status",
  header({ column }) {
    return (
      <div className="flex justify-center-safe">
        <SortableHeader title="Status" column={column} />
      </div>
    );
  },
  cell({ getValue }) {
    const status = getValue<PeerSendFile["status"]>();
    return (
      <div className="flex justify-center-safe">
        <Badge variant={status === "pending" ? "light" : "dot"} color="gray">
          {status}
        </Badge>
      </div>
    );
  },
  size: 120,
  maxSize: 120,
  enableSorting: true
});
