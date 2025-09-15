import type { PeerSendFile } from "@/state/types";

import { useMemo } from "react";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";
import { truncateFileName } from "../../utils";

export const fileNameColumn = columnHelper.accessor((row) => row.metadata, {
  id: "file-name",
  header({ column }) {
    return <SortableHeader title="File Name" column={column} />;
  },
  cell({ getValue }) {
    const metadata = getValue<PeerSendFile["metadata"]>();
    const fileName = useMemo(() => {
      return truncateFileName(metadata.name);
    }, []);

    return <span>{fileName}</span>;
  },
  size: undefined,
  enableSorting: true,
  sortDescFirst: true
});
