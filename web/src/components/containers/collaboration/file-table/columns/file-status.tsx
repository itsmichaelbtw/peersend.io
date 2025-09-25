import type { PeerSendFile } from "@/state/types";

import { Badge, Progress, Tooltip } from "@mantine/core";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";

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
