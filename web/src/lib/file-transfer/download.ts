import type { PeerSendFile } from "@/state/types";

import { fileStorage } from "./core";
import { triggerBrowserDownload } from "./utils";
import { createLogger } from "@/utils/logger";

const log = createLogger("FileDownload");

export function smartFileDownload(files: PeerSendFile[]): void {
	log.info(`Starting smart file download for ${files.length} files`);

	for (const file of files) {
		try {
			const nativeFile = fileStorage.getNativeFile(file.id, file.metadata);

			// zip or combine or do other things here
			// https://github.com/itsmichaelbtw/peersend.io/issues/39

			triggerBrowserDownload(nativeFile);
		} catch (error) {
			log.error(error);
		}
	}
}
