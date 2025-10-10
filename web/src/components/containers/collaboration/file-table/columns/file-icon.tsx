import { ThemeIcon } from "@mantine/core";
import { FileIcon } from "lucide-react";
import { columnHelper } from "../helper";

export const fileIconColumn = columnHelper.display({
  id: "file-icon",
  size: 48,
  cell() {
    return (
      <ThemeIcon variant="light" color="gray">
        <FileIcon size={18} className="text-gray-800" />
      </ThemeIcon>
    );
  }
});
