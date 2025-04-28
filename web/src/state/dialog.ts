import type { DialogState } from "@/types/state";

import { reactive } from "vue";

export const dialogState = reactive<DialogState>({
  upgradeDialogVisible: false
});
