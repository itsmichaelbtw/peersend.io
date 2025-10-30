import type { PeerSendFile } from "@/state/types";

import { createColumnHelper } from "@tanstack/react-table";

export const columnHelper = createColumnHelper<PeerSendFile>();
