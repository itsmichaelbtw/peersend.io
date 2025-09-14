import { useMemo } from "react";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";
import { truncateFileName } from "../../utils";

export const fileNameColumn = columnHelper.accessor((row) => row.file, {
  id: "file-name",
  header({ column }) {
    return <SortableHeader title="File Name" column={column} />;
  },
  cell({ getValue }) {
    const file = getValue<File>();
    const fileName = useMemo(() => {
      return truncateFileName(file.name);
    }, []);

    return <span>{fileName}</span>;
  },
  size: undefined,
  enableSorting: true,
  sortDescFirst: true
});
