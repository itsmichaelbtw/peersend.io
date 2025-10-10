import { ActionIcon, Menu } from "@mantine/core";
import { EllipsisIcon } from "lucide-react";
import { columnHelper } from "../helper";

export const fileActionsColumn = columnHelper.display({
  id: "file-actions",
  size: 52,
  maxSize: 52,
  cell() {
    return (
      <Menu>
        <Menu.Target>
          <div className="flex justify-end">
            <ActionIcon variant="subtle" color="gray" size="sm">
              <EllipsisIcon />
            </ActionIcon>
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Hello</Menu.Label>
        </Menu.Dropdown>
      </Menu>
    );
  }
});
