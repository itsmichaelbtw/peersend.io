import { useToast } from "primevue/usetoast";
import { copyToClipboard } from "@/utils/clipboard";

export function useCopyToClipboard() {
  const toast = useToast();

  function copy(value: string, label: string = "Copied") {
    if (!value) {
      return;
    }

    copyToClipboard(value, {
      onSuccess() {
        toast.add({
          severity: "success",
          summary: label,
          detail: `Copied "${value}" to clipboard`,
          life: 2000
        });
      },
      onError() {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to copy to clipboard",
          life: 2000
        });
      }
    });
  }

  return { copy };
}
