import { Checkbox } from "@mantine/core";
import { columnHelper } from "../helper";

export const selectionColumn = columnHelper.display({
  id: "file-select",
  header({ table }) {
    return (
      <Checkbox
        size="xs"
        styles={{
          input: {
            cursor: "pointer"
          }
        }}
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    );
  },
  cell({ row }) {
    return (
      <Checkbox
        size="xs"
        styles={{
          input: {
            cursor: "pointer"
          }
        }}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    );
  },
  size: 54
});
