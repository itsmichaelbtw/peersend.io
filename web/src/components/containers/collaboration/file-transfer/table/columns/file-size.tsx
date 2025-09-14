import { useMemo } from "react";
import { SortableHeader } from "../sorting-header";
import { columnHelper } from "../helper";
import { formatFileSize } from "../../utils";

export const fileSizeColumn = columnHelper.accessor((row) => row.file, {
  id: "file-size",
  header({ column }) {
    return (
      <div className="flex justify-start">
        <SortableHeader title="Size" column={column} />
      </div>
    );
  },
  cell({ getValue }) {
    const file = getValue<File>();
    const fileSize = useMemo(() => {
      return formatFileSize(file.size);
    }, []);

    return <div className="text-left">{fileSize}</div>;
  },
  size: 96,
  maxSize: 96,
  enableSorting: true,
  sortingFn(a, b) {
    const sizeA = a.original.file.size;
    const sizeB = b.original.file.size;

    return sizeA - sizeB;
  }
});
