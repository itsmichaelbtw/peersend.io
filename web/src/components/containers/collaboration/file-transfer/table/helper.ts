import type { PeerSendFile } from "@/context/file-transfer";

import { createColumnHelper } from "@tanstack/react-table";

export const columnHelper = createColumnHelper<PeerSendFile>();
